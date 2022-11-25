import axios from 'axios';
import io from 'socket.io-client';

const socketUrl = 'http://localhost:5000';
const api = "http://localhost:5000/api/v0";
const evaluateRoute = "/evaluate";
const scoreboardRoute = "/scoreboard";

// Sockets
export const socket = io.connect(socketUrl);

// Try catch then throwing error is redundant but leaving
// the structure in case of change.

// function to evaluate game
export const evaluate = async (token, evaluation) => {
  try {
    const res = await axios.post(`${api}${evaluateRoute}?e=${evaluation}&token=${token}`);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// function to get scoreboard
export const getScoreboard = async (scoreboardName) => {
  try {
    const res = await axios.get(`${api}${scoreboardRoute}/${scoreboardName}`);
    return res.data;
  } catch (err) {
    throw err;
  }
}
