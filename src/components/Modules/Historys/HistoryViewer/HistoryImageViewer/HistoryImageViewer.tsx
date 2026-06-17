import { useEffect, useState } from "react";
import { useImageBankContext } from "../../../../context/ImageBankContext";
import { HistoryModel } from "../../../../Models/History/HistoryModel";
import { MediaDataModel } from "../../../../Models/MediaData/MediaDataModel";
import ChargerSlice from "../../../ChargerSlice/ChargerSlice";

interface IHistoryImageViewer {
  setRunning: Function;
  data: HistoryModel;
  setLoad: Function;
}

const HistoryImageViewer = ({ setRunning, data, setLoad }: IHistoryImageViewer) => {
  const { searchImage } = useImageBankContext();
  const [mediaData, setMediaData] = useState<MediaDataModel>();

  useEffect(() => {
    const fetchImages = async () => {
      if (data.idMediaData) {
        try {
          const [image] = await Promise.all([searchImage(data.idMediaData)]);
          setMediaData(image!);
          setLoad(true)
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [data, searchImage]);
  return (
    <div>
      {mediaData ? (
        <img
          onMouseDown={() => {
            setRunning(false);
          }}
          onMouseUp={() => {
            setRunning(true);
          }}
          src={mediaData.Value}
          alt=""
        />
      ) : (
        <div className="spiner">
          <ChargerSlice />
        </div>
      )}
    </div>
  );
};

export default HistoryImageViewer;
