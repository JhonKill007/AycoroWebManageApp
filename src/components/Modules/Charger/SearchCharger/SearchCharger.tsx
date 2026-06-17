import './SearchCharger.css'
import "../chargerColor.css"

export const SearchCharger = () => {
    return (
        <>
            <div className="charger-search-box">
                <div className="circle-search-charger color-changing">
                </div>
                <div>
                    <div style={{width:'150px'}} className="name-search-chager color-changing"></div>
                    <div style={{width:'100px'}} className="name-search-chager color-changing"></div>
                </div>
            </div>
        </>
    )
}
