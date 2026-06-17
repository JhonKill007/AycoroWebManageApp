import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import "./EditModal.css";

interface IEditModal {
  setModalVisible: Function;
  isModalVisible: boolean;
  text: string;
  saveFunction: Function;
}

const EditModal = ({
  setModalVisible,
  isModalVisible,
  text,
  saveFunction,
}: IEditModal) => {
  const [textcoment, setTextcoment] = useState<string>(text);
  return (
    <>
      <div className="modal_box_coment">
        <div className="modal_container_coment">
          <div className="modal_button_coment">
            <div onClick={() => setModalVisible(false)}>
              <FontAwesomeIcon icon={faClose} />
            </div>
            <div
              onClick={() => {
                saveFunction(textcoment);
                setModalVisible(false);
              }}
            >
              <b style={{ color: "#1877f2" }}>Guardar</b>
            </div>
          </div>
          <div className="coment-box row">
            <div className="tex-area-coment-edit col-md-12">
              <div className="tex-area-coment-edit-container">
                {/* {Auth._User?.profilePhoto ? (
                  <img src={Auth._User?.profilePhoto} alt="" />
                ) : (
                  <img src={UserProfile} alt="" />
                )} */}
                <div className="tex-area-coment-edit-name">
                  {/* <b> {Auth._User?.user?.name}</b> */}
                </div>
              </div>
              <textarea
                value={textcoment}
                onChange={(e: any) => {
                  setTextcoment(e.target.value);
                }}
                placeholder="Escribe un comentario..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditModal;
