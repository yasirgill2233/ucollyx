import API from '../axios';

export const meetingsHubService = {
    // 1. Saari meetings lana (Hub ke liye)
    getHubMeetings: async () => {
        const { data } = await API.get('/meetings');
        return data;
    },

    // 2. Nayi meeting schedule karna (Hub modal se)
    createHubMeeting: async (meetingData) => {
        const { data } = await API.post('/meetings/create', meetingData);
        return data;
    },

    // 3. Meeting join link/details fetch karna
    getMeetingDetails: async (id) => {
        const { data } = await API.get(`/meetings/${id}`);
        return data;
    },

    // 4. Meeting status update (Completed/Live)
    updateMeetingStatus: async (id, status) => {
        const { data } = await API.patch(`/meetings/${id}/status`, { status });
        return data;
    }
};