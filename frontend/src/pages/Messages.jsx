import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getConversations,
  getConversation,
  getContacts,
  sendMessage,
} from '../services/messageService';
import styles from './Messages.module.css';

// Rafraîchissement automatique toutes les 5 s (polling). Choix assumé :
// plus simple que des WebSockets et largement suffisant pour ce projet.
const POLL_MS = 5000;

function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null); // interlocuteur actif { _id, prenom, nom, role }
  const [thread, setThread] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  // useCallback : la fonction garde la même identité entre deux rendus,
  // ce qui évite de relancer les useEffect qui l'utilisent à chaque rendu.
  const loadConversations = useCallback(() => {
    getConversations()
      .then(setConversations)
      .catch(() => setError('Impossible de charger les conversations.'));
  }, []);

  // Liste des conversations + contacts autorisés, avec rafraîchissement auto
  useEffect(() => {
    loadConversations();
    getContacts().then(setContacts).catch(() => {});
    const timer = setInterval(loadConversations, POLL_MS);
    return () => clearInterval(timer); // nettoyage quand on quitte la page
  }, [loadConversations]);

  // Fil de discussion de l'interlocuteur sélectionné, avec rafraîchissement auto.
  // L'appel au backend marque aussi les messages reçus comme lus.
  useEffect(() => {
    if (!selected) return;

    const loadThread = () => {
      getConversation(selected._id)
        .then((data) => {
          setThread(data);
          loadConversations(); // met à jour les pastilles "non lu"
        })
        .catch(() => {});
    };

    loadThread();
    const timer = setInterval(loadThread, POLL_MS);
    return () => clearInterval(timer);
  }, [selected, loadConversations]);

  // Défile vers le bas uniquement quand un nouveau message arrive
  // (dépendance sur la longueur, pas sur le tableau, sinon ça défilerait
  // à chaque rafraîchissement automatique).
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.length]);

  // L'interlocuteur d'un message = l'autre personne que moi
  const getOther = (msg) =>
    msg.expediteur._id === user.id ? msg.destinataire : msg.expediteur;

  const handleNewContact = (e) => {
    const contact = contacts.find((c) => c._id === e.target.value);
    if (contact) {
      setThread([]);
      setSelected(contact);
    }
  };

  const handleSelect = (other) => {
    setThread([]);
    setSelected(other);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !selected) return;

    setError(null);
    setSending(true);
    try {
      await sendMessage(selected._id, text);
      setText('');
      const data = await getConversation(selected._id);
      setThread(data);
      loadConversations();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });

  return (
    <div>
      <h1>Messagerie</h1>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.layout}>
        {/* Colonne gauche : conversations + nouveau message */}
        <aside className={styles.sidebar}>
          <select className={styles.newSelect} value="" onChange={handleNewContact}>
            <option value="">+ Nouveau message...</option>
            {contacts.map((c) => (
              <option key={c._id} value={c._id}>
                {c.prenom} {c.nom} ({c.role})
              </option>
            ))}
          </select>

          <div className={styles.convList}>
            {conversations.length === 0 && (
              <p className={styles.empty}>Aucune conversation.</p>
            )}
            {conversations.map((msg) => {
              const other = getOther(msg);
              const unread = !msg.lu && msg.destinataire._id === user.id;
              const active = selected?._id === other._id;
              return (
                <button
                  key={other._id}
                  className={active ? `${styles.convItem} ${styles.convActive}` : styles.convItem}
                  onClick={() => handleSelect(other)}
                >
                  <span className={styles.convName}>
                    {other.prenom} {other.nom}
                    {unread && <span className={styles.dot} />}
                  </span>
                  <span className={styles.convPreview}>{msg.contenu}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Colonne droite : fil de discussion */}
        <section className={styles.chat}>
          {!selected ? (
            <p className={styles.placeholder}>
              Choisis une conversation ou démarre un nouveau message.
            </p>
          ) : (
            <>
              <div className={styles.chatHeader}>
                {selected.prenom} {selected.nom}
                <span className={styles.chatRole}>{selected.role}</span>
              </div>

              <div className={styles.thread}>
                {thread.length === 0 && (
                  <p className={styles.placeholder}>Aucun message pour l'instant.</p>
                )}
                {thread.map((msg) => {
                  const mine = msg.expediteur._id === user.id;
                  return (
                    <div
                      key={msg._id}
                      className={mine ? `${styles.bubble} ${styles.mine}` : styles.bubble}
                    >
                      <p className={styles.bubbleText}>{msg.contenu}</p>
                      <span className={styles.bubbleDate}>{formatDate(msg.createdAt)}</span>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <form className={styles.sendForm} onSubmit={handleSend}>
                <input
                  className={styles.sendInput}
                  placeholder="Écris ton message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className={styles.sendButton} type="submit" disabled={sending || !text.trim()}>
                  Envoyer
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Messages;