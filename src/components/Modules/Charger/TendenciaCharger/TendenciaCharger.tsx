import { faComment, faHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './TendenciaCharger.css'
import "../chargerColor.css"

const TendenciaCharger = ({ imageSrc, username, likes, comments, tendencia }: any) => {
    return (
        <div className="popular-content-card col-md-2">
            <div className="card-image color-changing" />

            <div className="card-info">
                <div className="usercharge color-changing"/>

                <div className="interaction-info">
                    <span className="likes">
                        <FontAwesomeIcon icon={faHeart} />
                    </span>
                    <span className="comments">
                        <FontAwesomeIcon icon={faComment} />
                    </span>
                </div>
                <div className="tendencia color-changing" />
            </div>
        </div>
    );
};

export default TendenciaCharger;