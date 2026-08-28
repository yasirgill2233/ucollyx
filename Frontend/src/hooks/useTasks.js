import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../api/services/taskService';

export const useTasks = (projectId) => {
    const queryClient = useQueryClient();
    
    const queryKey = ['board', projectId];

    const boardQuery = useQuery({
        queryKey: queryKey,
        queryFn: () => taskService.getBoard(projectId),
        staleTime: 1000 * 60 * 5,
    });

    const updatePositionMutation = useMutation({
        mutationFn: ({ taskId, status, position }) => 
            taskService.updateTaskPosition(taskId, { status, position }),
            
        onMutate: async ({ taskId, status, position }) => {
            await queryClient.cancelQueries({ queryKey });

            const previousBoardData = queryClient.getQueryData(queryKey);

            if (previousBoardData) {
                const updatedTasks = { ...previousBoardData.tasks };
                const updatedColumns = { ...previousBoardData.columns };

                const oldColId = Object.keys(updatedColumns).find(colId => 
                    updatedColumns[colId].taskIds.includes(taskId)
                );

                if (oldColId) {
                    if (updatedTasks[taskId]) {
                        updatedTasks[taskId].status = status;
                    }

                    updatedColumns[oldColId].taskIds = updatedColumns[oldColId].taskIds.filter(
                        id => id !== taskId
                    );

                    const targetTaskIds = Array.from(updatedColumns[status].taskIds);
                    targetTaskIds.splice(position, 0, taskId);
                    updatedColumns[status].taskIds = targetTaskIds;

                    queryClient.setQueryData(queryKey, {
                        ...previousBoardData,
                        tasks: updatedTasks,
                        columns: updatedColumns
                    });
                }
            }

            return { previousBoardData };
        },
        onError: (err, variables, context) => {
            if (context?.previousBoardData) {
                queryClient.setQueryData(queryKey, context.previousBoardData);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    const createTaskMutation = useMutation({
        mutationFn: (taskData) => taskService.createTask(taskData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    return {
        boardData: boardQuery.data,
        isBoardLoading: boardQuery.isLoading,
        isBoardError: boardQuery.isError,
        updateTaskPosition: updatePositionMutation.mutate,
        createTask: createTaskMutation.mutate,
    };
};