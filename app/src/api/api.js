import axios from 'axios';

const api = "http://localhost:5000/api/v0";
const newGameRoute = "/new_game";
const queryRoute = "/query";
const evaluateRoute = "/evaluate";
const scoreboardRoute = "/scoreboard";

// Try catch then throwing error is redundant but leaving
// the structure in case of change.

// function to create a new game
export const createGame = async () => {
  try {
    const res = await axios.post(`${api}${newGameRoute}`);
    return res.data;
  } catch (err) {
    throw err;
  }
}

// function to make a query
export const queryModel = async (token, q) => {
  try {
    const res = await axios.post(`${api}${queryRoute}?q=${q}&token=${token}`);
    return res.data;
  } catch (err) {
    throw err;
  }
}

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
