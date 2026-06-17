import React from "react";

interface IError {
  error: string;
}

const AlertError = (props: IError) => {
  return (
    <div className="alert alert-danger" role="alert">
      {props.error}
    </div>
  );
};

export default AlertError;
