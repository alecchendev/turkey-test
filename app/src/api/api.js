import axios from 'axios';
import io from 'socket.io-client';

const socketUrl = '/';
const api = "/api/v0";
const scoreboardRoute = "/scoreboard";

// Sockets
export const socket = io.connect(socketUrl);

// function to get scoreboard
export const getScoreboard = async (scoreboardName) => {
  try {
    const res = await axios.get(`${api}${scoreboardRoute}/${scoreboardName}`);
    return res.data;
  } catch (err) {
    throw err;
  }
}
