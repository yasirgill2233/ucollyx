import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { issueService } from "../api/services/issueService";

// 1. Hook to fetch members dynamically when project changes
export const useProjectMembers = (projectId) => {
  return useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => issueService.getProjectMembers(projectId),
    enabled: !!projectId,
  });
};

// 2. Mutation hook to handle Bug Submission safely
export const useCreateIssue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueData) => issueService.createIssue(issueData),
    onSuccess: (data) => {
      // Form successfully submit hone par Kanban board refresh pipeline setup
      queryClient.invalidateQueries({ queryKey: ["issues", data.project_id] });
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
};

export const useIssues = (projectFilter) => {
  return useQuery({
    // projectFilter key array mein pass karne se Query automatic trigger hogi jab state badlegi
    queryKey: ["issues", projectFilter],
    queryFn: () => issueService.getIssues(projectFilter),
    refetchOnWindowFocus: false,
  });
};

export const usePriorityAlerts = (status) => {
  return useQuery({
    // 🔥 CRITICAL: 'status' ka key array mein hona laazmi hai warna navigation par refetch trigger nahi hoga
    queryKey: ["issues", "priority", status],
    queryFn: () => issueService.getPriorityIssues(status),
    refetchOnWindowFocus: false,
  });
};

export const useAssignedIssues = () => {
  return useQuery({
    queryKey: ["assignedIssues"],
    queryFn: () => issueService.getAssignedIssues(),
    refetchOnWindowFocus: false,
  });
};

// Mutation: Status Change Switcher
export const useUpdateIssueStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueService.updateIssueStatus,
    onSuccess: () => {
      // Data change hote hi dashboard ka cache clear ho jayega taake fresh state load ho
      queryClient.invalidateQueries({ queryKey: ["assignedIssues"] });
    }
  });
};

export const useReadyForQAIssues = () => {
  return useQuery({
    queryKey: ["issues", "readyForQA"],
    queryFn: issueService.getReadyForQAIssues,
    refetchOnWindowFocus: false,
  });
};

// Mutation for updating verification status
export const useVerifyIssueVerdict = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueService.verifyIssueVerdict,
    onSuccess: () => {
      // Dono caches invalidation triggers taake component se updated records foran gayab ho jayein
      queryClient.invalidateQueries({ queryKey: ["issues", "readyForQA"] });
    }
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Pattern Sync: Destructure variables directly into the service layer function
    mutationFn: async ({ issueId, comment_text }) => {
      return await issueService.addIssueComment(issueId, comment_text);
    },
    onSuccess: () => {
      // Automatic global background cache refresh triggers
      queryClient.invalidateQueries({ queryKey: ["issues", "readyForQA"] });
      queryClient.invalidateQueries({ queryKey: ["issues", "priority"] });
    }
  });
};