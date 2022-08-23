export const view = {
  none: 0,
  loader: 1,
  foldersView: 2,
  folderView: 3,
};

export const lang = [
  "Передача документов третьей стороне", // 0
  "Состав", // 1
  "Подготовка", // 2
  "документ", // 3
  "ов", // 4
  "а", // 5
  "был удалён!", // 6
  "+", // 7
  "Добавить", // 8
  "Данный способ пока не поддерживается", // 9
  "ВОССТАНОВИТЬ", // 10
  "Изменить", // 11
  "пакет", // 12
  "Редактирование", // 13
  "Новый", // 14
  "Название", // 15
  "ы", // 16
  "Способ доставки", // 17
  "Применить", // 18
  "Отмена", // 19
  "Копия", // 20
  "Оригинал", // 21
  "1", // 22
  "Формирование", // 23
  "Что передаем", // 24
  "В каком реестре", // 25
  "Текущий статус", // 26
  "Реестр", // 27
  "передачи", // 28
  "№", // 29
  "Сформировать", // 30
  "Включить лист подбора", // 31
  "Один получатель всех", // 32
  "Подготовленные", // 33
  "Обработать", // 34
  "Создан", // 35
  "Идёт", // 36
  "собраны", // 37
  "Идёт передача по реестру", // 38
  "Работа по передаче закончена", // 39
  "Получено", // 40
  "Выполнено", // 41
  "Курьер", // 42
  "Электронная почта", // 43
  "Почта России", // 44
  "Диадок", // 45
  "СДЭК", // 46
  "DHL", // 47
  "Заказчик", // 48
  "сбор", // 49
  "передача", // 50
  "не найдены", // 51
];

export const langData = {
  transferDocsToAThirdParty: 0, // "Передача документов третьей стороне"
  composition: 1, // "Состав"
  training: 2, // "Подготовка"
  document: 3, // "документ"
  ov: 4, // "ов"
  u: 5, // "а"
  wasRemoved: 6, // "был удалён!"
  plus: 7, // "+"
  add: 8, // "Добавить"
  thisMethodIsNotYetSupported: 9, // "Данный способ пока не поддерживается"
  reestablish: 10, // "ВОССТАНОВИТЬ"
  change: 11, // "Изменить"
  folder: 12, // "пакет"
  editing: 13, // "Редактирование"
  new: 14, // "Новый"
  name: 15, // "Название"
  s: 16, // "ы"
  deliveryMethod: 17, // "Способ доставки"
  apply: 18, // "Применить"
  cancel: 19, // "Отмена"
  copy: 20, // "Копия"
  original: 21, // "Оригинал"
  oneNum: 22, // "1"
  formation: 23, // "Формирование"
  whatWeTransfer: 24, // "Что передаем"
  inWhichRegister: 25, // "В каком реестре"
  currStatus: 26, // "Текущий статус"
  register: 27, // "Реестр"
  ofTransmission: 28, // "передачи"
  numSymbol: 29, // "№"
  toForm: 30, // "Сформировать"
  enableSelectionSheet: 31, // "Включить лист подбора"
  oneRecipientOfAll: 32, // "Один получатель всех"
  prepared: 33, // "Подготовленные"
  hanlde: 34, // "Обработать"
  created: 35, // "Создан"
  inProgress: 36, // "Идёт"
  collected: 37, // "собраны"
  transInProgress: 38, // "Идёт передача по реестру"
  transCompleted: 39, // "Работа по передаче закончена"
  recieved: 40, // "Получено"
  done: 41, // "Выполнено"
  courier: 42, // "Курьер"
  eMail: 43, // "Электронная почта"
  postOfRussia: 44, // "Почта России"
  diadoc: 45, // "Диадок"
  sdek: 46, // "СДЭК"
  dhl: 47, // "DHL"
  customer: 48, // "Заказчик"
  collection: 49, // "сбор"
  transfer: 50, // "передача"
  notFound: 51, // "не найдены"
};

export const currStats = ["", " await", " sent", " recieved", " done"];

export const regStats = [
  {
    id: 1,
    name: lang[langData.created],
  },
  {
    id: 2,
    name:
      lang[langData.inProgress] +
      " " +
      lang[langData.collection] +
      " " +
      lang[langData.document] +
      lang[langData.ov],
  },
  {
    id: 3,
    name:
      lang[langData.document][0].toUpperCase() +
      lang[langData.document].substr(1) +
      lang[langData.s] +
      " " +
      lang[langData.collected],
  },
  {
    id: 4,
    name: lang[langData.transInProgress],
  },
  {
    id: 5,
    name: lang[langData.transCompleted],
  },
];

export const statuses = [
  {
    name: lang[langData.training],
    id: 1,
  },
  {
    name: lang[langData.inProgress] + " " + lang[langData.collection],
    id: 2,
  },
  {
    name:
      lang[langData.document][0].toUpperCase() +
      lang[langData.document].substr(1) +
      lang[langData.s] +
      " " +
      lang[langData.collected],
    id: 3,
  },
  {
    name: lang[langData.inProgress] + " " + lang[langData.transfer],
    id: 4,
  },
  {
    name: lang[langData.done],
    id: 5,
  },
];

export const ways = [
  {
    id: 1,
    name: lang[langData.courier],
  },
  {
    id: 2,
    name: lang[langData.eMail],
  },
  {
    id: 3,
    name: lang[langData.postOfRussia],
  },
  {
    id: 4,
    name: lang[langData.diadoc],
  },
  {
    id: 5,
    name: lang[langData.sdek],
  },
  {
    id: 6,
    name: lang[langData.dhl],
  },
];

export const lilArr = ["", ""];

export const threeArr = ["", "", ""];

export const registers = [
  {
    name: `${lang[langData.register]} ${lang[langData.ofTransmission]} ${lang[langData.numSymbol]}`,
    statuses: statuses.map((el) => {
      return { ...el };
    }),
    url: "#",
    docUrl: "#",
  },
];
