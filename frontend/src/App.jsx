import { useState, useEffect } from 'react';

// STUDENT TODO: This API_URL works for local development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    isDelete: false
  });

  useEffect(() => {
    fetchTodos();
    const interval = setInterval(() => {
      fetchTodos();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/todos`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const executeAddTodo = async (todoText) => {
    try {
      await fetch(`${API_URL}/api/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: todoText })
      });
      triggerAlert(`Successfully added: "${todoText}"`, 'success');
      setNewTodo('');
      fetchTodos();
    } catch (err) {
      triggerAlert('Failed to add todo', 'error');
    }
  };

  const handleOpenAddModal = () => {
    if (!newTodo.trim()) return;
    
    setConfirmModal({
      show: true,
      title: 'Confirm New Task',
      message: `Are you sure you want to initialize and deploy this task to your workspace?\n\n"${newTodo}"`,
      isDelete: false,
      onConfirm: () => {
        executeAddTodo(newTodo);
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  const executeDeleteTodo = async (id, title) => {
    try {
      await fetch(`${API_URL}/api/todos/${id}`, {
        method: 'DELETE'
      });
      triggerAlert(`Successfully destroyed: "${title}"`, 'danger');
      fetchTodos();
    } catch (err) {
      triggerAlert('Failed to delete todo', 'error');
    }
  };

  const handleOpenDeleteModal = (id, title) => {
    setConfirmModal({
      show: true,
      title: 'Critical Action Alert',
      message: `This action will permanently purge this item from the infrastructure repository. This cannot be undone!\n\nTarget: "${title}"`,
      isDelete: true,
      onConfirm: () => {
        executeDeleteTodo(id, title);
        setConfirmModal(prev => ({ ...prev, show: false }));
      }
    });
  };

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; }
        * { box-sizing: border-box; }
        input:focus { outline: none; border-color: #4f46e5 !important; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        .btn-add:hover { background-color: #4338ca !important; transform: translateY(-1px); }
        .btn-add:active { transform: translateY(0); }
        .btn-delete:hover { background-color: #fee2e2 !important; transform: scale(1.08); }
        .btn-delete:active { transform: scale(0.92); }
        .todo-item-row:hover { border-color: #cbd5e1 !important; background-color: #f8fafc !important; }
        
        .popup-alert {
          position: fixed; top: 20px; right: 20px; padding: 14px 24px; border-radius: 10px; color: white;
          font-weight: 600; font-size: 14px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); z-index: 9999;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
          transform: translateX(${alert.show ? '0' : '150%'}); opacity: ${alert.show ? '1' : '0'};
        }

        .modal-backdrop {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background-color: rgba(15, 23, 42, 0.6); display: flex;
          justify-content: center; align-items: center; z-index: 10000;
          opacity: ${confirmModal.show ? '1' : '0'};
          pointer-events: ${confirmModal.show ? 'all' : 'none'};
          transition: opacity 0.2s ease;
        }

        .modal-box {
          background-color: white; padding: 24px; border-radius: 14px;
          width: 90%; max-width: 400px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          transform: translateY(${confirmModal.show ? '0' : '-30px'});
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      <div className="popup-alert" style={{ backgroundColor: alert.type === 'success' ? '#10b981' : alert.type === 'danger' ? '#ef4444' : '#64748b' }}>
        {alert.type === 'success' ? '✨ ' : '🗑️ '} {alert.message}
      </div>

      <div className="modal-backdrop">
        <div className="modal-box">
          <h3 style={{ ...styles.modalTitle, color: confirmModal.isDelete ? '#dc2626' : '#1e1b4b' }}>
            {confirmModal.title}
          </h3>
          <p style={styles.modalMessage}>{confirmModal.message}</p>
          <div style={styles.modalActions}>
            <button 
              onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))} 
              style={styles.modalCancelBtn}
            >
              Cancel
            </button>
            <button 
              onClick={confirmModal.onConfirm} 
              style={{
                ...styles.modalConfirmBtn,
                backgroundColor: confirmModal.isDelete ? '#ef4444' : '#4f46e5'
              }}
            >
              Confirm Act
            </button>
          </div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <h1 style={styles.title}>DevOps Todo App</h1>
          <p style={styles.subtitle}>Group 5 - COMP1682.2 - FInal Year Projects Part 2</p>
        </div>

        {/* Form Add Todo */}
        <div style={styles.form}>
          <input 
            value={newTodo} 
            onChange={(e) => setNewTodo(e.target.value)} 
            placeholder="Add new todo..." 
            style={styles.input} 
            onKeyDown={(e) => e.key === 'Enter' && handleOpenAddModal()}
          />
          <button onClick={handleOpenAddModal} className="btn-add" style={styles.button}>
            Add Todo
          </button>
        </div>

        {/* Todo List Card */}
        <div style={styles.todoCard}>
          <h2 style={styles.cardTitle}>Production Pipeline Tasks</h2>
          
          {todos.length === 0 ? (
            <p style={styles.emptyState}>No tasks available. All logs clear!</p>
          ) : (
            <ul style={styles.todoList}>
              {todos.map(todo => (
                <li key={todo.id} className="todo-item-row" style={styles.todoItem}>
                  <div style={styles.todoContent}>
                    <span style={styles.statusDot}></span>
                    <span style={styles.todoText}>{todo.title}</span>
                  </div>
                  
                  <button 
                    onClick={() => handleOpenDeleteModal(todo.id, todo.title)} 
                    className="btn-delete" 
                    style={styles.deleteButton} 
                    title="Purge Task"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill="#ef4444"/>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '50px', paddingBottom: '50px' },
  container: { width: '100%', maxWidth: '600px', padding: '0 20px' },
  header: { textAlign: 'center', marginBottom: '28px' },
  title: { fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0' },
  subtitle: { fontSize: '15px', color: '#64748b', margin: 0, fontWeight: '500' },
  form: { display: 'flex', gap: '10px', marginBottom: '20px' },
  input: { flex: 1, padding: '12px 16px', fontSize: '15px', border: '1px solid #cbd5e1', borderRadius: '10px', backgroundColor: '#ffffff', transition: 'all 0.2s ease' },
  button: { padding: '12px 22px', fontSize: '15px', fontWeight: '600', color: '#ffffff', backgroundColor: '#4f46e5', border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.15)' },
  todoCard: { backgroundColor: '#ffffff', borderRadius: '14px', padding: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.04)', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', margin: '0 0 14px 0', fontWeight: '700' },
  todoList: { listStyle: 'none', padding: 0, margin: 0 },
  todoItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '8px', marginBottom: '6px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', transition: 'all 0.2s ease' },
  todoContent: { display: 'flex', alignItems: 'center', gap: '12px', maxWidth: '85%' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0 },
  todoText: { fontSize: '15px', fontWeight: '500', color: '#334155', wordBreak: 'break-word' },
  deleteButton: { background: 'none', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' },
  emptyState: { textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '10px 0', margin: 0 },
  footerCard: { marginTop: '25px', padding: '16px', backgroundColor: '#eff6ff', border: '1px dashed #bfdbfe', borderRadius: '12px' },
  footerTitle: { fontSize: '13px', color: '#1e40af', margin: '0 0 8px 0' },
  footerList: { margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1e3a8a', lineHeight: '1.6' },
  

  modalTitle: { margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700' },
  modalMessage: { margin: '0 0 20px 0', fontSize: '14px', color: '#475569', lineHeight: '1.5', whiteSpace: 'pre-line' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  modalCancelBtn: { padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  modalConfirmBtn: { padding: '10px 16px', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: '600', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }
};

export default App;