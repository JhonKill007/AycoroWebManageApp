import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { HistoryListItemModel } from "../Models/History/HistoryListItemModel";
import { HistoryModel } from "../Models/History/HistoryModel";
import historyService from "../Services/History/HistoryService";

interface HistoryContextProps {
  chargingHistorys: boolean;
  chargingMyHistorys: boolean;
  getMyHistorys: (id: string) => void;
  getHistoryList: (section: number) => void;
  historys: HistoryListItemModel[];
  myHistorys: HistoryListItemModel[];
  updateHistorys: (historys: HistoryListItemModel[]) => void;
  uploadHistory: (history: any) => void;
  deleteHistory: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextProps | undefined>(
  undefined
);

interface HistoryProviderProps {
  children: ReactNode;
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({
  children,
}) => {
  const [historys, setHistorys] = useState<HistoryListItemModel[]>([]);
  const [myHistorys, setMyhistorys] = useState<HistoryListItemModel[]>([]);
  const [chargingHistorys, setchargingHistorys] = useState<boolean>(true);
  const [chargingMyHistorys, setchargingMyHistorys] = useState<boolean>(true);

  useEffect(() => {
    getMyHistorys();
    getHistoryList(1);
  }, []);

  const getMyHistorys = () => {
    historyService
      .GetMyHistorys()
      .then((e: any) => {
        setMyhistorys(e.data);
        setchargingMyHistorys(false);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const getHistoryList = (section: number) => {
    historyService
      .GetHistoryList(section)
      .then((e: any) => {
        setHistorys((prevHistorys) => [...prevHistorys, ...e.data]);
        setchargingHistorys(false);
      })
      .catch((err: any) => {
        console.error(err);
      });
  };

  const updateHistorys = (historys: HistoryListItemModel[]) => {
    setHistorys(historys);
  };

  const deleteHistory = (id: string) => {
    const historyArray = myHistorys[0].historysData!.filter(
      (h: HistoryModel) => h.id != id
    );
    const historyUser = myHistorys.map((D: HistoryListItemModel) => {
      D.historysData = historyArray;
      return D;
    });
    setMyhistorys(historyUser);
  };

  const uploadHistory = (history: any) => {
    if (history) {
      addMyHistorys(history);
    }
  };

  const addMyHistorys = (history: any) => {
    const historyArray = myHistorys![0].historysData!.concat(history);
    const historyUser = myHistorys!.map((D: HistoryListItemModel) => {
      return {
        ...D,
        historysData: historyArray,
      };
    });

    setMyhistorys(historyUser);
  };

  return (
    <HistoryContext.Provider
      value={{
        chargingHistorys,
        chargingMyHistorys,
        getMyHistorys,
        getHistoryList,
        historys,
        myHistorys,
        updateHistorys,
        uploadHistory,
        deleteHistory,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistoryContext = (): HistoryContextProps => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error(
      "useHistoryContext debe ser utilizado dentro de un HistoryProvider"
    );
  }
  return context;
};
