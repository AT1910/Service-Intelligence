import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Guests API
export const createGuest = async (guestData) => {
  const response = await axios.post(`${API}/guests`, guestData);
  return response.data;
};

export const getGuests = async () => {
  const response = await axios.get(`${API}/guests`);
  return response.data;
};

export const getGuest = async (guestId) => {
  const response = await axios.get(`${API}/guests/${guestId}`);
  return response.data;
};

export const updateGuest = async (guestId, guestData) => {
  const response = await axios.put(`${API}/guests/${guestId}`, guestData);
  return response.data;
};

export const deleteGuest = async (guestId) => {
  const response = await axios.delete(`${API}/guests/${guestId}`);
  return response.data;
};

// Reservations API
export const createReservation = async (reservationData) => {
  const response = await axios.post(`${API}/reservations`, reservationData);
  return response.data;
};

export const getReservations = async (serviceDate = null) => {
  const url = serviceDate ? `${API}/reservations?service_date=${serviceDate}` : `${API}/reservations`;
  const response = await axios.get(url);
  return response.data;
};

export const updateReservation = async (reservationId, reservationData) => {
  const response = await axios.put(`${API}/reservations/${reservationId}`, reservationData);
  return response.data;
};

export const deleteReservation = async (reservationId) => {
  const response = await axios.delete(`${API}/reservations/${reservationId}`);
  return response.data;
};

// Staff API
export const createStaff = async (staffData) => {
  const response = await axios.post(`${API}/staff`, staffData);
  return response.data;
};

export const getStaff = async () => {
  const response = await axios.get(`${API}/staff`);
  return response.data;
};

export const updateStaff = async (staffId, staffData) => {
  const response = await axios.put(`${API}/staff/${staffId}`, staffData);
  return response.data;
};

export const deleteStaff = async (staffId) => {
  const response = await axios.delete(`${API}/staff/${staffId}`);
  return response.data;
};

// Staff Schedules API
export const createSchedule = async (scheduleData) => {
  const response = await axios.post(`${API}/schedules`, scheduleData);
  return response.data;
};

export const getSchedules = async (serviceDate = null) => {
  const url = serviceDate ? `${API}/schedules?service_date=${serviceDate}` : `${API}/schedules`;
  const response = await axios.get(url);
  return response.data;
};

export const updateSchedule = async (scheduleId, scheduleData) => {
  const response = await axios.put(`${API}/schedules/${scheduleId}`, scheduleData);
  return response.data;
};

export const deleteSchedule = async (scheduleId) => {
  const response = await axios.delete(`${API}/schedules/${scheduleId}`);
  return response.data;
};

// Service Config API
export const createServiceConfig = async (configData) => {
  const response = await axios.post(`${API}/service-config`, configData);
  return response.data;
};

export const getServiceConfig = async (serviceDate) => {
  const response = await axios.get(`${API}/service-config?service_date=${serviceDate}`);
  return response.data;
};

export const updateServiceConfig = async (serviceDate, configData) => {
  const response = await axios.put(`${API}/service-config/${serviceDate}`, configData);
  return response.data;
};

// Briefing API
export const generateBriefing = async (serviceDate) => {
  const response = await axios.post(`${API}/generate-briefing`, { service_date: serviceDate });
  return response.data;
};
