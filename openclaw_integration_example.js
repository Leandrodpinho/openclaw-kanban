// Exemplo de como o OpenClaw pode atualizar o status de uma tarefa no Kanban
// Isso pode ser transformado em uma Skill ou usado em scripts.

const axios = require('axios'); // Você precisará instalar axios: npm install axios

const KANBAN_URL = 'http://localhost:3000/api/tasks';

async function createTask(title) {
  try {
    const response = await axios.post(KANBAN_URL, { title });
    console.log('Tarefa criada:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('Erro ao criar tarefa:', error.message);
  }
}

async function updateStatus(taskId, newStatus) {
  try {
    const response = await axios.put(`${KANBAN_URL}/${taskId}`, { status: newStatus });
    console.log('Status atualizado:', response.data);
  } catch (error) {
    console.error('Erro ao atualizar status:', error.message);
  }
}

// Exemplo de uso:
// (async () => {
//   const taskId = await createTask('Verificar logs do servidor');
//   // ... openclaw trabalha ...
//   await updateStatus(taskId, 'inprogress');
//   // ... openclaw termina ...
//   await updateStatus(taskId, 'done');
// })();
