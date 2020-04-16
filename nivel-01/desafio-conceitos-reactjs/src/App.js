import React, { useState, useEffect } from "react";
import api from './services/api';

import "./styles.css";

function App() {
  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    api.get('repositories').then(response => {
      
      setRepositories(response.data);
    });
  }, []);

  async function handleAddRepository() {
    const repositoriesOptions = [
      {
        title: 'Front-end com ReactJS',
        techs: ['ReactJS'],
        url: 'https://github.com/Shofnip/front-end-reactjs',
      },
      {
        title: 'Back-end com NodeJS',
        techs: ['NodeJS'],
        url: 'https://github.com/Shofnip/back-end-Nodejs',
      },
      {
        title: 'Mobile com React Native',
        techs: ['React Native'],
        url: 'https://github.com/Shofnip/mobile-react-native',
      },
      {
        title: 'Desafio Web Rocketseat',
        techs: ['NodeJS', 'ReactJS'],
        url: 'https://github.com/Shofnip/desafio-web-rocketseat',
      },
      {
        title: 'Desafio Mobile Rocketseat',
        techs: ['NodeJS', 'React Native'],
        url: 'https://github.com/Shofnip/desafio-mobile-rocketseat',
      },
      {
        title: 'Calculadora Web',
        techs: ['ReactJS'],
        url: 'https://github.com/Shofnip/calculadora-web',
      },
      {
        title: 'Calendário Mobile',
        techs: ['React Native'],
        url: 'https://github.com/Shofnip/calendario-mobile',
      },
      {
        title: 'Foguete GoStack',
        techs: ['NodeJS', 'ReactJS', 'React Native'],
        url: 'https://github.com/Shofnip/foguete-gostack',
      },
    ];

    const newRepository = repositoriesOptions[Math.floor(Math.random() * repositoriesOptions.length)];

    const response = await api.post('repositories', {
      title: newRepository.title,
      techs: newRepository.techs,
      url: newRepository.url,
    });

    const repository = response.data;

    setRepositories([...repositories, repository]);
  }

  async function handleRemoveRepository(id) {
    await api.delete(`repositories/${id}`);
    
    setRepositories(repositories.filter(repository => repository.id !== id));
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {repositories.map(repository => (
          <li key={repository.id}>
            {repository.title}
            <button onClick={() => handleRemoveRepository(repository.id)}>
              Remover
            </button>
          </li>
        ))}
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
