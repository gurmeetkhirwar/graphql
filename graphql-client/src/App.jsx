import './App.css'
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_GAMES } from "./GraphQL/Queries";
import { ADD_GAME, UPDATE_GAME, DELETE_GAME } from "./GraphQL/Mutations";
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';



function App() {
  const { loading, error, data, refetch } = useQuery(GET_GAMES);
  const [addGame] = useMutation(ADD_GAME);
  const [updateGame] = useMutation(UPDATE_GAME);
  const [deleteGame] = useMutation(DELETE_GAME);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    platform: []
  });
  const [platformInput, setPlatformInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePlatformAdd = () => {
    if (platformInput.trim() && !formData.platform.includes(platformInput.trim())) {
      setFormData({
        ...formData,
        platform: [...formData.platform, platformInput.trim()]
      });
      setPlatformInput('');
    }
  };

  const handlePlatformRemove = (platformToRemove) => {
    setFormData({
      ...formData,
      platform: formData.platform.filter(p => p !== platformToRemove)
    });
  };

  const handleAddGame = async () => {
    try {
      if (!formData.title || formData.platform.length === 0) {
        setErrorMessage('Title and at least one platform are required');
        return;
      }

      await addGame({
        variables: {
          game: {
            title: formData.title,
            platform: formData.platform
          }
        }
      });

      setShowModal(false);
      setFormData({ title: '', platform: [] });
      setErrorMessage('');
      refetch();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleEditGame = async () => {
    try {
      if (!formData.title || formData.platform.length === 0) {
        setErrorMessage('Title and at least one platform are required');
        return;
      }

      await updateGame({
        variables: {
          id: currentGame.id,
          edits: {
            title: formData.title,
            platform: formData.platform
          }
        }
      });

      setShowEditModal(false);
      setFormData({ title: '', platform: [] });
      setErrorMessage('');
      refetch();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleDeleteGame = async (id) => {
    try {
      await deleteGame({
        variables: { id }
      });
      refetch();
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleEditClick = (game) => {
    setCurrentGame(game);
    setFormData({
      title: game.title,
      platform: [...game.platform]
    });
    setShowEditModal(true);
  };

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error?.message}</div>


  return (
    <>
      {/* Header */}
      <header className='header__container'>
        <h1>Game List</h1>
        <Button variant='secondary' onClick={() => setShowModal(true)}>
          Add Game
        </Button>
      </header>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {/* Game List */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Platform(s)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.games.map((game) => (
            <tr key={game.id}>
              <td>{game.id}</td>
              <td>{game.title}</td>
              <td>{game.platform.join(', ')}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEditClick(game)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteGame(game.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Game Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter game title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Platforms</Form.Label>
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={platformInput}
                  onChange={(e) => setPlatformInput(e.target.value)}
                  placeholder="Enter platform"
                />
                <Button variant="secondary" onClick={handlePlatformAdd} className="ms-2">
                  Add
                </Button>
              </div>
              <div>
                {formData.platform.map((platform) => (
                  <span key={platform} className="badge bg-primary me-2">
                    {platform}
                    <Button
                      variant="link"
                      className="text-white p-0 ms-1"
                      onClick={() => handlePlatformRemove(platform)}
                    >
                      ×
                    </Button>
                  </span>
                ))}
              </div>
            </Form.Group>
          </Form>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddGame}>
            Save Game
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Game Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Game</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter game title"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Platforms</Form.Label>
              <div className="d-flex mb-2">
                <Form.Control
                  type="text"
                  value={platformInput}
                  onChange={(e) => setPlatformInput(e.target.value)}
                  placeholder="Enter platform"
                />
                <Button variant="secondary" onClick={handlePlatformAdd} className="ms-2">
                  Add
                </Button>
              </div>
              <div>
                {formData.platform.map((platform) => (
                  <span key={platform} className="badge bg-primary me-2">
                    {platform}
                    <Button
                      variant="link"
                      className="text-white p-0 ms-1"
                      onClick={() => handlePlatformRemove(platform)}
                    >
                      ×
                    </Button>
                  </span>
                ))}
              </div>
            </Form.Group>
          </Form>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditGame}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default App
