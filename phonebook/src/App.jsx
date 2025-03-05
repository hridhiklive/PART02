import { useState, useEffect } from 'react'
import noteService from './services/notes'

const Filter = ({ text, value, onChange }) => {
  return (
    <>
      {text}<input value={value} onChange={onChange} />
    </>
  )
}

const PersonForm = ({ onSubmit, data }) => {
  return (
    <form onSubmit={onSubmit}>
      <Single sets={data} />
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Single = ({ sets }) => {
  return (
    <>
      {sets.map((set, index) => (
        <div key={index}>
          {set.text}: <input value={set.value} onChange={set.onChange} />
        </div>
      ))}
    </>
  )
}

const Persons = ({ data, onClick }) => (
  data.map((person) => (
    <div key={person.id}>
      <span>{person.name} </span><span>{person.number}</span> <span><Button text='delete' onClick={onClick} name={person.name} id={person.id} /></span>
    </div>
  ))
)

const Button = ({ onClick, text, name, id }) => {
  return (
    <>
      <button onClick={() => onClick(name, id)}>{text}</button>
    </>
  )
}

const Notification = ({ message }) => {
  if (!message || !message.text) {
    return null
  }
  return (
    <div className={message.type === 'error' ? 'error' : 'success'}>
      {message.text}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [numberFilter, setNumberFilter] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    noteService.getAll()
      .then(response => {
        setPersons(response.data)
      })
      .catch(error => {
        console.error('Failed to fetch persons:', error)
      })
  }, [])

  const addNote = (event) => {
    event.preventDefault()
    const existingPerson = persons.find(person => person.name === newName)

    if (existingPerson) {
      if (window.confirm(`${newName} is already added to phonebook, replace the old one with new one`)) {
        const noteObject = {
          name: newName,
          number: newPhone,
        }
        noteService.update(existingPerson.id, noteObject)
          .then(response => {
            setPersons(persons.map(person => person.id !== existingPerson.id ? person : response.data))
            setMessage({ text: 'Changed phone number', type: 'success' })
            setTimeout(() => {
              setMessage(null)
            }, 5000)
            setNewName('')
            setNewPhone('')
          })
          .catch(error => {
            console.error('Failed to update person:', error)
            setMessage({ text: `Information of '${existingPerson.name}' has already been removed from server`, type: 'error' })
            setPersons(persons.filter(person => person.id !== existingPerson.id))
            setTimeout(() => {
              setMessage(null)
            }, 5000)
            setNewName('')
            setNewPhone('')
          })
      }
    } else {
      const noteObject = {
        name: newName,
        number: newPhone,
      }
      noteService.create(noteObject)
        .then(response => {
          setPersons(persons.concat(response.data))
          setMessage({ text: `Added ${newName}`, type: 'success' })
          setTimeout(() => {
            setMessage(null)
          }, 5000)
          setNewName('')
          setNewPhone('')
        })
        .catch(error => {
          console.error('Failed to add person:', error)
          alert('There was an error adding the person.')
        })
    }
  }

  const removeId = (name, id) => {
    if (window.confirm(`Delete ${name}`)) {
      noteService.remove(id)
        .then(response => {
          setPersons(persons.filter(person => person.id !== id))
        })
        .catch(error => {
          console.error('Failed to delete:', error)
          setMessage({ text: `Information of ${name} has already been removed from server`, type: 'error' })
          setPersons(persons.filter(person => person.id !== id))
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value.trim())
  }

  const handlePhoneChange = (event) => {
    setNewPhone(event.target.value.trim())
  }

  const filteredPersons = persons.filter(
    (person) =>
      person.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
      person.number.includes(numberFilter)
  );

  const handleNameFilterChange = (event) => {
    setNameFilter(event.target.value)
  }

  const handleNumberFilterChange = (event) => {
    setNumberFilter(event.target.value)
  }

  const data = [
    { text: "name", value: newName, onChange: handleNameChange },
    { text: "number", value: newPhone, onChange: handlePhoneChange }
  ]

  return (
    <div>
      <Notification message={message} />
      <h2>Phonebook</h2>
      <Filter value={nameFilter} onChange={handleNameFilterChange} text="filter by name:" />
      <Filter value={numberFilter} onChange={handleNumberFilterChange} text="filter by number:" />
      <h3>Add a new</h3>
      <PersonForm onSubmit={addNote} data={data} />
      <h3>Numbers</h3>
      <Persons data={filteredPersons} onClick={removeId} />
    </div>
  )
}

export default App