import { useEffect, useState } from "react";
import { useImageBankContext } from "../../../../context/ImageBankContext";
import { PostModel } from "../../../../Models/Post/PostModel";

interface IPerfilPublicationImage {
  scrollToElement: Function;
  index: number;
  publication: PostModel;
}

const PerfilPublicationImage = ({
  scrollToElement,
  index,
  publication,
}: IPerfilPublicationImage) => {
  const [image, setImage] = useState<any>();
  const { searchImage } = useImageBankContext();

  useEffect(() => {
    const fetchImages = async () => {
      if (publication.idMediaData) {
        try {
          const [postImage] = await Promise.all([
            searchImage(publication.idMediaData!),
          ]);
          setImage(postImage!);
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImages();
  }, [publication, searchImage]);

  return (
    <img
      onClick={() => scrollToElement(index)}
      key={publication.id}
      style={{ cursor: "pointer" }}
      className="PhotoPost"
      src={image?.value}
      alt=""
    />
  );
};

export default PerfilPublicationImage;
