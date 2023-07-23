document.addEventListener('DOMContentLoaded', function() {
  /**
   * Obtiene un pokemon
   * @param id
   * @returns {Promise<{abilities: *, types: *, img: *, moves: *, name: *, weight: *}>}
   */
  function getPokemon(id) {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    return fetchData(url)
      .then(data => {
        if (!data) return;

        return {
          name: data.name,
          img: data.sprites.front_default,
          height: data.height,
          weight: data.weight,
          types: data.types.map(type => type.type.name),
          abilities: data.abilities,
          moves: data.moves,
        };
      });
  }

  /**
   * Obtener habilidades del pokemon enviado
   * @param abilityObj
   * @returns {Promise<unknown[]>}
   */
  function getPokemonAbilities(abilityObj) {
    const abilitiesPromises = abilityObj.abilities.map(ability => {
      const url = ability.ability.url;
      return fetchData(url)
        .then(data => {
          const language = 'en'; // Definir el idioma deseado aquí
          const abilityName = data.names.find(name => name.language.name === language);
          return abilityName ? abilityName.name : 'Unknown';
        });
    });

    return Promise.all(abilitiesPromises)
      .then(abilities => {
        abilityObj.abilities = abilities;
        return abilityObj;
      });
  }

  /**
   * Obtener movimientos del pokemon enviado
   * @param moveObj
   * @returns {Promise<unknown[]>}
   */
  function getPokemonMoves(moveObj) {
    const movesPromises = moveObj.moves.map(move => {
      const url = move.move.url;
      return fetchData(url)
        .then(data => {
          const language = 'en'; // Definir el idioma deseado aquí
          const moveName = data.names.find(name => name.language.name === language);
          return moveName ? moveName.name : 'Unknown';
        });
    });

    return Promise.all(movesPromises)
      .then(moves => {
        moveObj.moves = moves.slice(0, 5); // Mostrar solo los primeros 5 movimientos
        return moveObj;
      });
  }

  /**
   * Render de informacion del pokemon en el DOM
   * @param pokemon
   */
  function renderPokemon(pokemon) {
    const pokemonDiv = document.createElement('div');

    // Agregar el nombre del Pokémon (H3)
    const pokemonName = document.createElement('h3');
    pokemonName.textContent = pokemon.name;
    pokemonDiv.appendChild(pokemonName);

    // Agregar la imagen del Pokémon
    const pokemonImg = document.createElement('img');
    pokemonImg.setAttribute('src', pokemon.img);
    pokemonDiv.appendChild(pokemonImg);

    // Agregar el resto de atributos (altura, peso, tipos, habilidades y movimientos)
    const heightP = document.createElement('p');
    heightP.innerHTML = `<b>Height:</b> ${pokemon.height}`;
    pokemonDiv.appendChild(heightP);

    const weightP = document.createElement('p');
    weightP.innerHTML = `<b>Weight:</b> ${pokemon.weight}`;
    pokemonDiv.appendChild(weightP);

    const typesP = document.createElement('p');
    typesP.innerHTML = `<b>Types:</b> ${pokemon.types.join(', ')}`;
    pokemonDiv.appendChild(typesP);

    const abilitiesP = document.createElement('p');
    abilitiesP.innerHTML = `<b>Abilities:</b> ${pokemon.abilities.join(', ')}`;
    pokemonDiv.appendChild(abilitiesP);

    const movesP = document.createElement('p');
    movesP.innerHTML = `<b>Moves:</b> ${pokemon.moves.join(', ')}`;
    pokemonDiv.appendChild(movesP);

    // Agregar al DOM
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
    pokemonInfoDiv.innerHTML = ''; // Limpiar el contenido previo
    pokemonInfoDiv.appendChild(pokemonDiv);
  }

  /**
   * Se recomienda el uso de esta utilidad en vez de fetch directo
   *
   * @param url
   * @returns {Promise<any>}
   */
  function fetchData(url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .catch(error => {
        console.log(`Error fetching data: ${error}`);
        throw error; // Propagar el error para que las funciones que llamen a fetchData lo manejen
      });
  }

  /**
   * Obtiene enteros randoms basado en un rango de numeros
   *
   * @param min
   * @param max
   * @returns {number}
   */
  function getRandomNumber(min, max) {
    const uniqueRandom = () => {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      return num !== uniqueRandom.last ? (uniqueRandom.last = num) : uniqueRandom();
    };
    return uniqueRandom();
  }

  /**
   * Funcion de renders de items enviados por parametros (array de ids)
   *
   * @param ids
   */
  function renderArrayItems(ids) {
    // Validación de que ids es un array
    if (!Array.isArray(ids)) {
      console.log('Not a valid array');
      return;
    }

    // Limpiar el DOM de elementos de búsquedas previas
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
    pokemonInfoDiv.innerHTML = '';

    // Iterar por cada id del array "ids"
    ids.forEach(id => {
      getPokemon(id)
        .then(pokemon => {
          if (pokemon) {
            return getPokemonAbilities(pokemon); // Obtener las habilidades del pokemon
          } else {
            console.log(`Pokemon with id ${id} not found`);
          }
        })
        .then(pokemonWithAbilities => {
          if (pokemonWithAbilities) {
            return getPokemonMoves(pokemonWithAbilities); // Obtener los movimientos del pokemon
          }
        })
        .then(pokemonWithAbilitiesAndMoves => {
          if (pokemonWithAbilitiesAndMoves) {
            renderPokemon(pokemonWithAbilitiesAndMoves); // Renderizar la información del pokemon
          }
        })
        .catch(error => {
          console.log(`Error fetching Pokemon with id ${id}: ${error}`);
        });
    });
  }

  /**
   * Función principal de render usando el campo de texto 'searchValue'
   */
  function renderItems() {
    const value = document.getElementById('searchValue').value;
    // Validar que el campo de texto no esté vacío antes de ejecutar la búsqueda
    if (value.trim() !== '') {
      const idsOrNames = value.split(',');
      renderArrayItems(idsOrNames);
    }
  }

  // Agregar evento 'click' al botón 'Buscar'
  document.getElementById('search').addEventListener('click', renderItems);

  // Agregar evento 'keyup' al campo de texto para ejecutar la búsqueda al presionar 'Enter'
  document.getElementById('searchValue').addEventListener('keyup', event => {
    if (event.key === 'Enter') {
      renderItems();
    }
  });

  // Agregar la funcionalidad del botón "Agregar" que hace lo mismo que el botón "Buscar"
  document.getElementById('add').addEventListener('click', renderItems);

  // Agregar evento 'click' al botón 'Random'
  document.getElementById('random').addEventListener('click', () => {
    const randomIds = [];
    for (let i = 0; i < 4; i++) {
      const randomId = getRandomNumber(1, 1010);
      randomIds.push(randomId);
    }
    renderArrayItems(randomIds);
  });

  // Agregar evento 'click' al botón 'Limpiar'
  document.getElementById('clear').addEventListener('click', () => {
    const pokemonInfoDiv = document.getElementById('pokemonInfo');
    pokemonInfoDiv.innerHTML = '';
  });

  // Iniciación de la app
  function init() {
    // Foco automático en el campo de texto
    document.getElementById('searchValue').focus();
  }

  // Llamar a la función 'init' para iniciar la app
  init();
});
