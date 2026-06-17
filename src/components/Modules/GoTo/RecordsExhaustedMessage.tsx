import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import './RecordsExhaustedMessage.css';

const RecordsExhaustedComponent = () => {
  return (
    <div className="records-exhausted-container col-md-6">
      <div className="divIcon">
        <FontAwesomeIcon className="icon-dropdown check-message" icon={faCheck} />
      </div>
      <p className="message">
        ¡Has visto todas las publicaciones de tu feed!
        Ve al explorador para ver más contenido divertido
      </p>
      <Link to="/explorer" className="explorer-link">
        <b>Explorador</b>
      </Link>
    </div>
  );
};

export default RecordsExhaustedComponent;
