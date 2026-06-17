import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import './PostOptions.css'
import Status from '../../Services/Status/StatusService';
import History from '../../Services/History/HistoryService';

interface IPostPerfilOptions {
    setViewOP: Function
    Data: any
    FilterData: Function
    whereCode: boolean
    setHyRunnig?: Function
}

const PostPerfilOptions = ({ setViewOP, Data, FilterData, whereCode, setHyRunnig }: IPostPerfilOptions) => {
    const DeletePost = () => {
        Status.ApplyStatusToDelete(Data?.id)
            .then((e: any) => {
                FilterData(Data?.id)
                setViewOP(false)
            })
            .catch((err: any) => {
                console.error(err);
            })
    }

    const ArchivedPost = () => {
        // Status.ApplyStatusToArchived({ idpost: Data?.id, iduser: Data?.idUser })
        Status.ApplyStatusToArchived(Data?.id)
            .then((e: any) => {
                FilterData(Data?.id)
                setViewOP(false)
            })
            .catch((err: any) => {
                console.error(err);
            })
    }


    const DesArchivedPost = () => {
        Status.ApplyStatusToActive(Data?.id)
            .then((e: any) => {
                FilterData(Data?.id)
                setViewOP(false)
            })
            .catch((err: any) => {
                console.error(err);
            })
    }

    const DeleteMyHistory = () => {
        History.Delete(Data?.id)
            .then((e: any) => {
                FilterData(Data?.id!)
                setViewOP(false)
            })
            .catch((err: any) => {
                console.error(err);
            })
    }

    return (
        <div className="OPmodal_box">
            <div className="OPmodal_container">
                <div className="OPmodal_button">
                    <div
                        onClick={() => {
                            if (setHyRunnig) {
                                setHyRunnig(true)
                            }
                            setViewOP(false)
                        }}
                        className='closeBox'>
                        <FontAwesomeIcon icon={faClose} />
                    </div>
                    {whereCode
                        ? (<div className="OptionsList">
                            <div className='OPoption' onClick={DeletePost}>
                                <b id='Eliminar'>Eliminar</b>
                            </div>
                            <div className='OPoption'>
                                <b>Editar</b>
                            </div>
                            {Data.status == 9 && (
                                <div className='OPoption' onClick={ArchivedPost}>
                                    <b>Archivar</b>
                                </div>
                            )}
                            {Data.status == 12 && (
                                <div className='OPoption' onClick={DesArchivedPost}>
                                    <b>Desarchivar</b>
                                </div>
                            )}
                            <div className='OPoption' onClick={() => setViewOP(false)}>
                                <b>Cancelar</b>
                            </div>
                        </div>)
                        : (<div className="OptionsList">
                            <div className='OPoption' onClick={DeleteMyHistory}>
                                <b id='Eliminar'>Eliminar</b>
                            </div>
                            <div className='OPoption' onClick={() => { if (setHyRunnig) { setHyRunnig(true) } setViewOP(false) }}>
                                <b>Cancelar</b>
                            </div>
                        </div>)}

                </div>
            </div>
        </div >
    )
}

export default PostPerfilOptions