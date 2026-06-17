import { useEffect, useState } from "react";
import { Colors } from "../../../../constants/Colors";

interface IHistoryProgressBar {
  indexUser: number;
  indexMap: number;
  indexH: number;
  NextHistory: Function;
  running: boolean;
}

const HistoryProgressBar = (props: IHistoryProgressBar) => {
  const [indexUser, setIndexUser] = useState<number>(0);
  const [porcet, setPorcet] = useState<number>(0);
  const [run, setRun] = useState<boolean>(false);
  const milSeg: number = 50;

  useEffect(() => {
    if (props.indexMap === props.indexH) {
      setRun(true);
    }
  }, [props.indexMap, props.indexH]);

  // useEffect(() => {

  // }, [props.indexUser, indexUser])

  useEffect(() => {
    if (porcet < 100.5 && run && props.running) {
      const time = setTimeout(() => {
        if (props.indexUser !== indexUser) {
          setPorcet((prev) => (prev = 0));
          setIndexUser(props.indexUser);
        } else {
          setPorcet((prev) => (prev += 0.5));
        }
      }, milSeg);
      // if (props.indexUser !== indexUser) {
      //     setPorcet(prev => prev = 0)
      //     setIndexUser(props.indexUser)
      //     clearTimeout(time)
      // }
    }
  }, [porcet, run, props.running, props.indexUser, indexUser, milSeg]);

  useEffect(() => {
    if (porcet === 100.5) {
      props.NextHistory();
    }
  }, [porcet]);

  return (
    <div
      className="progress"
      style={{
        height: "4px",
        width: `${porcet}%`,
        backgroundColor: Colors.detailAppColor,
        transition: "width 0.1s",
      }}
    ></div>
  );
};

export default HistoryProgressBar;
