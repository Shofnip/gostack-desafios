const express = require("express");
const cors = require("cors");
const { uuid } = require("uuidv4");

// const { uuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

app.get("/repositories", (request, response) => {
  const results = repositories;

  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const { title, techs, url } = request.body;

  const repository = {
    id: uuid(),
    title,
    techs,
    url,
    likes: 0,
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, techs, url } = request.body;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0) return response.status(400).json({ error: 'Repository doesnt exist.'});
  
  const likes = repositories[repositoryIndex].likes;
  const repository = {
    id,
    title,
    techs,
    url,
    likes
  }

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0) return response.status(400).json({ error: 'Repository doesnt exist.'});

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0) return response.status(400).json({ error: 'Repository doesnt exist.'});

  const repository = repositories[repositoryIndex];
  repository.likes++;

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

module.exports = app;
