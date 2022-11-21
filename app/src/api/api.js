import axios from 'axios';

const api = "http://localhost:5000/api/v0";
const newGameRoute = "/new_game";
const queryRoute = "/query";
const evaluateRoute = "/evaluate";
const scoreboardRoute = "/scoreboard";

// function to create a new game
export const createGame = async () => {
  try {
    const res = await axios.post(`${api}${newGameRoute}`);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// function to make a query
export const queryModel = async (q) => {
  try {
    const res = await axios.post(`${api}${queryRoute}?q=${q}`);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// function to evaluate game
export const evaluate = async (evaluation) => {
  try {
    const res = await axios.post(`${api}${evaluateRoute}?e=${evaluation}`);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// function to get scoreboard
export const getScoreboard = async (scoreboardName) => {
  try {
    const res = await axios.get(`${api}${scoreboardRoute}/${scoreboardName}`);
    return res.data;
  } catch (err) {
    console.log(err);
    return null;
  }
}