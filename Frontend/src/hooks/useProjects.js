import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../api/services/projectService';

export const useProjectsData = () => {
  return useQuery({
    queryKey: ['projects-data'],
    queryFn: async () => {
      // Parallel fetch using Promise.all
      const [projectsRes, usersRes] = await Promise.all([
        projectService.getProjects(),
        projectService.getUsersForProject()
      ]);
      return { projectsRes, usersRes };
    }
  });
};

export const useMyProjects = () => {
  return useQuery({
    queryKey: ['my-projects'],
    queryFn: projectService.getMyProjects
  })
};

export const useProjectMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => queryClient.invalidateQueries(['projects-data']),
  });

  const teamMutation = useMutation({
    mutationFn: ({ projectId, members }) => projectService.saveTeam(projectId, members),
    onSuccess: () => queryClient.invalidateQueries(['projects-data']),
  });

  const archiveMutation = useMutation({
    mutationFn: projectService.archiveProject,
    onSuccess: () => queryClient.invalidateQueries(['projects-data']),
  });

  const activeMutation = useMutation({
    mutationFn: projectService.activeProject,
    onSuccess: () => queryClient.invalidateQueries(['projects-data']),
  });

  return { createMutation, teamMutation, archiveMutation, activeMutation };
};