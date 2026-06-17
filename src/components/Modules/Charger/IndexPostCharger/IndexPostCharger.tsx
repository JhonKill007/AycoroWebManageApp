import {
    faComment,
    faEllipsisVertical,
    faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../chargerColor.css";
import "./IndexPostCharger.css";

const IndexPostCharger = () => {
  return (
    <div className="container disable-div">
      <div className="row">
        <div className="col-md-8 square publication">
          <div className="ImageBoxCharger color-changing"></div>
          <div className="InteratorPostCharger">
            <div className="LikeComentIcon">
              <div className="LikeIcon">
                <FontAwesomeIcon
                  className="icon color-changing-icon"
                  icon={faHeart}
                />
              </div>
              <div className="ComentnIcon">
                <FontAwesomeIcon
                  className="icon color-changing-icon"
                  icon={faComment}
                />
              </div>
            </div>
            <div className="settingIcon">
              <FontAwesomeIcon
                className="icon color-changing-icon"
                icon={faEllipsisVertical}
              />
            </div>
          </div>
          <div className="statePublicationCharger space color-changing"></div>
          <div className="statePublicationCharger color-changing"></div>
        </div>
      </div>
      <br />
      <br />
    </div>
  );
};

export default IndexPostCharger;
