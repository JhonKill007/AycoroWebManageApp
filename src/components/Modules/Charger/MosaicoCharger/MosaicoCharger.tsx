
import "../chargerColor.css"
import "./MosaicoCharger.css"

const MosaicoCharger = () => {
    const imageUrls = [
        'url_imagen_1',
        'url_imagen_2',
        'url_imagen_3',
        'url_imagen_4',
        'url_imagen_5',
        'url_imagen_6',
        'url_imagen_7',
        'url_imagen_8',
        'url_imagen_9',
        'url_imagen_10',
        'url_imagen_11',
        'url_imagen_12',
        'url_imagen_13',
    ];
    return (
        <div className="photo-mosaic col-md-10">
            {imageUrls.map((e: any, index: number) => {
                let size = '';
                if (index % 5 === 0) {
                    size = 'large';
                } else if (index % 7 === 0) {
                    size = 'medium';
                } else {
                    size = 'small';
                }
                return (
                    <div key={index} style={{ height: '200px' }} className={`photo-tile ${size} color-changing `}>
                    </div>
                );
            })}
        </div>
    );
};

export default MosaicoCharger;