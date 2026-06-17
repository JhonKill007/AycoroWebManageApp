import {
  faChevronLeft,
  faChevronRight,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PostModel } from "../../Models/Post/PostModel";
import PublicationsDetails from "../Publications/Publication/PublicationsDetails";
import "./PublicationModalView.css";

interface IPublicationModalView {
  setModalVisible: Function;
  isModalVisible: boolean;
  publications: PostModel[];
  setPublications: Function;
  setIndex: Function;
  index: number;
}

const PublicationModalView = ({
  setModalVisible,
  isModalVisible,
  publications,
  setPublications,
  setIndex,
  index,
}: IPublicationModalView) => {
  return (
    <div className="PublicationModalBox">
      <div className="PublicationModalContainer">
        <div className="div_view_container">
          <div className="chevron_box">
            {index !== 0 && (
              <div
                onClick={() => {
                  if (index > 0) {
                    setIndex(index - 1);
                  }
                }}
              >
                <FontAwesomeIcon
                  className="arrow_left_box"
                  icon={faChevronLeft}
                />
              </div>
            )}
          </div>
          <div className="ViewPublicationModal">
            <PublicationsDetails publication={publications[index]} removePublication={setPublications} />
          </div>
          <div className="chevron_box">
            {publications.length > index + 1 && (
              <div
                onClick={() => {
                  setIndex(index + 1);
                }}
              >
                <FontAwesomeIcon
                  className="arrow_left_box"
                  icon={faChevronRight}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div
          onClick={() => {
            setModalVisible(false);
          }}
        >
          <FontAwesomeIcon className="closeIcon" icon={faClose} />
        </div>
      </div>
    </div>
  );
};

export default PublicationModalView;
