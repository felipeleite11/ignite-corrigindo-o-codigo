const express = require("express");

const { v4: uuid } = require("uuid");

const app = express();

app.use(express.json());

const repositories = [];

function repositoryExists(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0) {
    return response.status(404).json({ error: 'Repository not found' })
  }

  request.repositoryIndex = repositoryIndex
  request.repository = repositories[repositoryIndex]

  return next()
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  const repoExists = repositories.find(repo => repo.id === repository.id);

  if(repoExists) {
    return response.status(500).json({ error: 'This repository is already exists' });
  }

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", repositoryExists, (request, response) => {
  let { repository } = request

  const { id, likes } = repository

  repository = {
    ...request.body,
    id,
    likes
  }

  return response.json(repository);
});

app.delete("/repositories/:id", repositoryExists, (request, response) => {
  const { repositoryIndex } = request
  
  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", repositoryExists, (request, response) => {
  const { repository } = request

  repository.likes++

  return response.json({ likes: repository.likes });
});

module.exports = app;
