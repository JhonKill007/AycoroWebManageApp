import { useThemeContext } from "../../context/ThemeContext";
import { UserModel } from "../../Models/User/UserModel";
import "./SearchBox.css";
import SearchItem from "./SearchItem";

interface ISearch {
  users: UserModel[];
}

const SearchBox = ({ users }: ISearch) => {
  const { theme } = useThemeContext();
  return (
    // <div className="col-md-5 search-box">
    //   <div className="conteiner_search_box col-md-12">
    //     {!users ? (
    //       <>
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //         <SearchCharger />
    //       </>
    //     ) : (
    //       users.map((u: UserModel, index) => (
    //         <SearchItem key={index} user={u} />
    //       ))
    //     )}
    //   </div>
    //   <br />
    //   <br />
    // </div>

    <div>
      <div
        style={{
          backgroundColor: theme === "light" ? "#fafafa" : "#1a1a1a",
          borderRadius: "12px",
          padding: "20px",
          border: `1px solid ${theme === "light" ? "#e0e0e0" : "#333"}`,
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          height: 600,
          width: 400,
          margin: "auto",
          overflow: "auto",
        }}
      >
        <div>
          {users.map((user) => (
            <SearchItem
              key={user._id + user.PerfilData?.IdMediaDataProfile!}
              user={user}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBox;
