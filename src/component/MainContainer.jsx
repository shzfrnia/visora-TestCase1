import React, {Component} from 'react'
import {view, lang, langData, statuses, currStats, ways, regStats} from '../constants'
import API from '../API'
import FolderData from './FolderData'
import RegistersData from './RegistersData';

let delay = 0;
let delDocIndex = -1;
const pathname = document.location.pathname;

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

export default class TasksDesk extends Component
{
  constructor(props)
  {
    super(props)

    const object = {
      id: 0,
      name: "",
      documents: [],
      selWayIDs: [1],
      customer: {
        id: 0,
        name: ""
      }
    };

    this.state = {
      viewMode: view.loader,
      selWayID: 0,
      folderViewObject: object,
      folderCopy: object,
      isEdit: false,
      lang,
      popupText: "",
      selType: null,
      folderTypesArr: [],
      selDocs: [],
      registers: [],
      docsCont: null,
      createRegLoader: false,
      regParams: [true, false],
      isInit: true,
      isClickOnStat: false
    };

    TasksDesk.this = this;
  }

  componentDidMount = async () =>
  {
    window.addEventListener("popstate", (ev) =>
    {
      if (!ev.state) return;

      this.state.selWayID = 0;

      this.changeViewMode(ev.state.viewMode);
    });

    let data;

    const searchLoc = document.location.search.toLowerCase();

    if (searchLoc)
    {
      await this.sleep(500);

      if (searchLoc.includes("?add"))
      {
        this.addFolder();

        return;
      }

      const searchArr = searchLoc.split("&");

      if (searchArr[0].includes("?pid="))
      {
        const folderID = +searchArr[0].split("=")[1];

        data = await this.getData("/ParseBills", {full: 1, id: folderID, needSettings: 1});

        await this.prepareSettings(data);

        if (!data.success)
        {
          this.changeViewMode(view.none);

          return;
        }

        if (searchArr.length > 1)
        {
          if (searchArr[1].includes("vr="))
          {
            this.state.selWayID = (+searchArr[1].split("=")[1]) - 1;
          }
          else 
          {
            if (searchArr[1].includes("v=1"))
            {
              this.state.isEdit = true;
            }
            else 
            {
              window.history.replaceState({viewMode: view.folderView}, "", "?PID=" + folderID + "&vr=1")
            }
          }
        }
        else 
        {
          window.history.replaceState({viewMode: view.folderView}, "", "?PID=" + folderID + "&vr=1")
        }

        let folderViewObject = this.state.folderViewObject;

        folderViewObject.name = data ?.bills[0] ?.name || "";
        folderViewObject.id = folderID;

        this.getFolderView(data);
      }

      return;
    }

    data = await this.getData("/ParseBills", {needSettings: 1});

    if (!data.success)
    {
      this.changeViewMode(view.none);

      return;
    }

    this.prepareSettings(data);
    this.getFoldersData();
  }

  setDelay = (f, t) =>
  {
    clearTimeout(delay);
    delay = setTimeout(f, t);
  }

  prepareSettings = (data) =>
  {
    if (data.settings)
    {
      const settings = JSON.parse(data.settings);

      if (settings.regs)
      {
        const regArr = settings.regs.split("|")

        this.state.regParams = [regArr[0] ? true : false, regArr[1] ? true : false];
      }

      if (settings.status)
      {
        statuses.some(stat =>
        {
          if (stat.id == +settings.status)
          {
            this.state.selType = stat;

            return true;
          }

          return false;
        })
      }
    }
  }

  getFoldersData = async () =>
  {
    this.changeViewMode(view.loader);

    await this.sleep(500);

    this.state.isInit = false;

    let data = await this.getData("/ParseBills", {status: this.state.selType ?.id || 0});

    if (!data.success)
    {
      this.changeViewMode(view.none);

      return;
    }

    this.state.folderTypesArr = data.bills ? this.prepareFoldersData(data.bills) : [];

    this.changeViewMode(view.foldersView);
  }

  getData = async (method, data, baseURL) =>
  {
    const response = await API.post(method, {data}, baseURL ? {baseURL} : undefined);

    return response.data.d;
  }

  changeViewMode = (viewMode) =>
  {
    this.state.viewMode = viewMode;

    switch (viewMode)
    {
      case view.foldersView:
        {
          if (this.state.isInit)
          {
            this.getFoldersData();

            return;
          }

          window.history.replaceState({viewMode}, "", pathname);

          break;
        }
      case view.folderView:
        {
          this.state.folderCopy = this.getObjectCopy(this.state.folderViewObject);

          break;
        }
    }

    this.fillNavigations();
    this.forceUpdate();
  }

  pushHistState = (val) =>
  {
    window.history.pushState({viewMode: view.folderView}, "", val);
  }

  componentDidUpdate()
  {
    setTimeout(() =>
    {
      document.dispatchEvent(new CustomEvent("title-mod-start"));
    }, 10)
  }

  fillNavigations = () =>
  {
    const {lang} = this.state;

    const backBtnCont = document.getElementsByClassName("main-tb-filter-ch1")[0];
    const controlBtnsCont = document.getElementsByClassName("main-tb-filter-ch2")[0];

    backBtnCont.innerHTML = "";
    controlBtnsCont.innerHTML = "";

    let backBtn = document.createElement("div");
    backBtn.className = "navText";

    let innerHTML = "<div>" + lang[langData.transferDocsToAThirdParty] + "</div>";

    if (this.state.viewMode == view.folderView)
    {
      backBtn = document.createElement("a");
      backBtn.href = "#";
      backBtn.className = "link-new navButton";
      innerHTML = "<i></i>" + innerHTML;

      backBtn.addEventListener("click", (ev) =>
      {
        ev.preventDefault();
        this.closeFolderView();
      })

      if (!this.state.isEdit) 
      {
        const btnsArr = this.getArrCopy(ways);

        btnsArr.unshift({id: 0, name: lang[langData.composition] + " " + lang[langData.ofTransmission]});

        for (let i = 0; i < btnsArr.length; i++)
        {
          const way = btnsArr[i];

          if (!i || this.state.folderViewObject.selWayIDs.indexOf(way.id) >= 0) 
          {
            const btn = document.createElement("a");
            btn.href = "#";
            btn.className = "my-infoTitle-view" + (this.state.selWayID == way.id ? "-sel" : "");
            btn.innerHTML = way.name;

            btn.addEventListener("click", (ev) =>
            {
              ev.preventDefault();

              for (let i = 0; i < controlBtnsCont.children.length; i++)
              {
                controlBtnsCont.children[i].className = "my-infoTitle-view";
              }

              btn.className = "my-infoTitle-view-sel";

              window.history.replaceState({viewMode: view.folderView}, "", "?PID=" + this.state.folderViewObject.id + "&vr=" + (way.id + 1))

              this.state.selWayID = way.id;

              this.forceUpdate();
            })

            controlBtnsCont.append(btn);
          }
        }
      }
    }

    backBtn.innerHTML = innerHTML;

    backBtnCont.append(backBtn);
  }

  closeFolderView = () =>
  {
    const object = {
      id: 0,
      name: "",
      documents: [],
      selWayIDs: [1],
      customer: {
        id: 0,
        name: ""
      }
    };

    this.state.folderCopy = object;
    this.state.folderViewObject = object;
    this.state.registers = [];
    this.state.selDocs = [];
    this.state.selWayID = 0;

    this.changeViewMode(view.foldersView);
  }

  prepareFoldersData = (folders) =>
  {
    let foldersArr = [];

    folders.forEach(fold =>
    {
      if (!fold.status)
      {
        fold.status = 1
      }
    })

    for (let i = 1; i < 6; i++)
    {
      let name = statuses[i - 1].name;

      if (folders.some(folder => {return folder.status == i}))
      {
        foldersArr.push({name, status: i, folders: folders.filter(folder => folder.status == i)})
      }
    }

    return foldersArr;
  }

  getCurrDateTime = (date) =>
  {
    if (!date) return "";

    date = date.replace(/-/g, '/').replace('T', ' ');

    const tempDate = new Date(date);
    let hours = tempDate.getHours();
    let mins = tempDate.getMinutes();
    hours = hours < 10 ? "0" + hours : hours;
    mins = mins < 10 ? "0" + mins : mins;

    return tempDate.toLocaleDateString('ru-RU', {month: 'numeric', day: 'numeric', year: 'numeric'}).replace(',', "") + " в " + hours + ":" + mins;
  }

  prepareRegisters = (registers) =>
  {
    const {lang} = this.state;

    registers.sort((a, b) =>
    {
      if (a.num < b.num) return - 1;

      return 0;
    }).forEach(reg =>
    {
      reg.name = lang[langData.register] + " " + lang[langData.ofTransmission] + " " + lang[langData.numSymbol] + reg.num;

      const stats = this.getArrCopy(regStats);

      if (!reg.statuses) 
      {
        stats[0].on = 1;

        reg.statuses = stats.reverse();

        return;
      }

      reg.statuses.sort((a, b) =>
      {
        if (a.id > b.id) return - 1;

        return 0;
      })

      const currStatID = reg.statuses[0].id;
      let currDate = this.getCurrDateTime(reg.statuses[0].date);

      stats.reverse().forEach((stat, index) =>
      {
        if (stat.id <= currStatID)
        {
          reg.statuses.some(rStat =>
          {
            if (stat.id == rStat.id && rStat.date)
            {
              currDate = this.getCurrDateTime(rStat.date);
            }
          })

          stat.date = currDate;

          if (stat.id == currStatID)
          {
            stat.on = 1;
          }
          else 
          {
            if (stat.id < currStatID)
            {
              stat.done = 1;
            }
          }
        }

        // if (!reg.statuses.some((rStat, ind) =>
        // {
        //   if (rStat.id == stat.id)
        //   {
        //     if (ind == reg.statuses.length - 1)
        //     {
        //       stat.on = 1;
        //     }
        //     else 
        //     {
        //       stat.done = 1;
        //     }

        //     date = rStat.date ? this.getCurrDateTime(rStat.date) : "";
        //     stat.date = date;

        //     return true;
        //   }

        //   return false;
        // }))
        // {
        //   if (stat.id == 5) return;

        //   const nextStat = stats[index + 1];

        //   if (reg.statuses.some(rStat => {return nextStat.id == rStat.id}))
        //   {
        //     stat.done = 1;
        //     stat.date = date || "";
        //   }
        // }
      })

      reg.statuses = stats;
    })

    return registers
  }

  controlBtnClick = async (ev, isApply) =>
  {
    const {folderTypesArr, folderCopy, folderViewObject} = this.state;

    ev.preventDefault();

    if (!isApply)
    {
      if (!folderViewObject.id)
      {
        this.closeFolderView();

        return;
      }

      this.state.isEdit = false;
      window.history.replaceState({viewMode: view.folderView}, "", "?PID=" + folderViewObject.id + "&vr=1");

      this.fillNavigations();
      this.forceUpdate();

      return;
    }

    const name = folderCopy.name;

    if (!name) return;

    let docs = folderViewObject.documents;

    if (
      name != folderViewObject.name
      ||
      docs.length
      ||
      folderCopy.selWayIDs.length != folderViewObject.selWayIDs.length
      ||
      !folderCopy.selWayIDs.some(cWay => {return folderViewObject.selWayIDs.some(way => {return way == cWay})})
      ||
      folderCopy.customer.id != folderViewObject.customer.id
    ) 
    {
      let delivs = "|";

      folderCopy.selWayIDs.forEach(way =>
      {
        delivs += way + "|";
      })

      let data = {
        bill: {
          id: folderCopy.id || undefined,
          name,
          delivs,
          docs: docs.length ? docs : undefined,
          custID: folderCopy.customer.id
        }
      };

      data = await this.getData("/ParseBills", data);
      this.state.folderTypesArr = data.bills ? this.prepareFoldersData(data.bills) : [];

      if (!data.success)
      {
        this.changeViewMode(view.none);

        return;
      }

      if (data.id)
      {
        folderCopy.id = data.id;
      }
      if (folderTypesArr.length) 
      {
        folderTypesArr[0].folders[folderTypesArr[0].folders.length - 1].id = folderCopy.id;

        this.state.folderTypesArr = data.bills ? this.prepareFoldersData(data.bills) : folderTypesArr;

        folderCopy.documents = folderCopy.documents.filter(doc => !doc.del);

        const fold = {name, status: 1, docCount: folderCopy.documents.length, documents: folderCopy.documents, selWayIDs: folderCopy.selWayIDs, customer: folderCopy.customer};

        if (folderTypesArr[0].status == 1)
        {
          let ind;
          let id;

          if (folderTypesArr[0].folders.some((folder, index) =>
          {
            if (folder.id == folderCopy.id)
            {
              ind = index;
              id = folder.id

              return true;
            }

            return false;
          }))
          {
            folderTypesArr[0].folders[ind] = {...fold, id};
          }
          else
          {
            this.state.folderTypesArr[0].folders.push(fold);
          }
        }
        else 
        {
          this.state.folderTypesArr.unshift({folders: [fold], name: this.state.lang[langData.training], status: 1});
        }
      }

      this.state.folderViewObject = this.getObjectCopy(folderCopy);
      this.state.isEdit = false;
      window.history.replaceState({viewMode: view.folderView}, "", "?PID=" + folderViewObject.id + "&vr=1");

      this.fillNavigations();
      this.forceUpdate();
    }
    else 
    {
      this.state.isEdit = false;

      this.fillNavigations();
      this.forceUpdate();
    }
  }

  getObjectCopy = (object) =>
  {
    return JSON.parse(JSON.stringify(object));
  }

  popupRef = (popupDiv) =>
  {
    $(popupDiv).show();
    $.event.trigger({type: "errInit"});
  }

  closeModal = () =>
  {
    this.state.popupText = "";
    delDocIndex = -1;

    this.forceUpdate();
  }

  setSelStat = (ev, stat) =>
  {
    const {selType} = this.state;

    ev.preventDefault();

    this.state.selType = !selType || selType.id != stat.id ? stat : null;
    this.state.isClickOnStat = true;

    this.saveSettings(this.state.selType ?.id || 0);

    this.forceUpdate();
  }

  getCurrCount = (count) =>
  {
    const {lang} = this.state;

    const baseWord = lang[langData.document];
    const lastNum = count[count.length - 1];

    if (count.length > 1)
    {
      const preLastNum = count[count.length - 2];

      if (preLastNum == "1")
      {
        return count + " " + baseWord + lang[langData.ov];
      }
    }

    switch (lastNum)
    {
      case "1":
        {
          return count + " " + baseWord;
        }
      case "2":
      case "3":
      case "4":
        {
          return count + " " + baseWord + lang[langData.u];
        }
      default:
        {
          return count + " " + baseWord + lang[langData.ov];
        }
    }
  }

  openFolder = async (folder, ev) =>
  {
    let folderViewObject = this.state.folderViewObject;

    folderViewObject.name = folder.name;
    folderViewObject.id = folder.id;

    if (ev)
    {
      ev.preventDefault();

      this.state.isEdit = false;

      this.pushHistState("?PID=" + folder.id + "&vr=1");

      if (folder.docs)
      {
        folderViewObject.documents = this.getArrCopy(folder.docs);
        // folderViewObject.selWayIDs = JSON.parse(JSON.stringify(folder.selWayIDs));
        // folderViewObject.customer = JSON.parse(JSON.stringify(folder.customer));

        this.changeViewMode(view.folderView);
        return;
      }

      this.changeViewMode(view.loader);

      await this.sleep(500)
    }

    const data = await this.getData("/ParseBills", {id: folder.id});

    this.getFolderView(data);
  }

  getFolderView = (data) =>
  {
    if (data.success)
    {
      if (data.bills)
      {
        let folderViewObject = this.state.folderViewObject;

        folderViewObject.documents = data.bills[0].docs ? data.bills[0].docs : [];
        folderViewObject.selWayIDs = data.bills[0].delivs ? data.bills[0].delivs.substring(1, data.bills[0].delivs.length - 1).split("|").map(way => {return +way}) : [1];
        folderViewObject.customer = data.bills[0].customer || {id: 0, name: ""};
      }

      this.state.registers = data.pdfs ? this.prepareRegisters(data.pdfs) : [];

      this.changeViewMode(view.folderView);
    }
    else 
    {
      this.changeViewMode(view.none);
    }
  }

  sleep = async (time) =>
  {
    await new Promise((resolve, rej) =>
    {
      setTimeout(async () =>
      {
        resolve();
      }, time)
    })
  }

  addFolder = (ev) =>
  {
    if (ev)
    {
      ev.preventDefault();
      this.pushHistState("?add");
    }

    this.state.isEdit = true;
    this.state.folderViewObject.id = this.state.folderTypesArr.length + 1;

    this.changeViewMode(view.folderView);
  }

  initDocuments = async (ev, documents) =>
  {
    ev.preventDefault();
    const id = documents.length
    const doc = {
      id,
      name: `Doc ${id + 1}`,
      registers: getRandomIntInclusive(0, statuses.length),
      status: "Загружен"
    }
    this.state.folderViewObject.documents.push(doc);
    documents.push(doc);
    this.forceUpdate();
  }

  prepareToDel = async (ev, index) =>
  {
    const {lang} = this.state;

    ev.preventDefault();

    if (this.state.popupText)
    {
      await this.closeModal();
    }

    const doc = this.state.folderCopy.documents[index];

    doc.del = 1;

    delDocIndex = index;
    this.state.popupText = lang[langData.document][0].toUpperCase() + lang[langData.document].substr(1) + " " + doc.name + " " + lang[langData.wasRemoved];

    this.forceUpdate();
  }

  restoreDelFile = (ev) =>
  {
    ev.preventDefault();

    this.state.folderCopy.documents[delDocIndex].del = 0;

    this.closeModal();
  }

  renderSvg = (type) =>
  {
    if (type == 1)
    {
      return (
        <svg
          viewBox="0 0 42 40"
          fill="none"
        >
          <path
            d="M41.7855 15.4036C41.6165 15.2067 41.3697 15.0931 41.109 15.0931H39.2582V5.11518C39.2582 4.43167 38.7023 3.87574 38.0188 3.87574H16.5207L14.7786 0.972738C14.5564 0.601186 14.1491 0.370544 13.7158 0.370544H4.04288C3.36006 0.371245 2.80414 0.92717 2.80414 1.60998V15.0924H0.890301C0.630916 15.0924 0.384851 15.2052 0.215901 15.4015C0.046249 15.5978 -0.0294633 15.8579 0.00979493 16.1166L3.45681 38.8681C3.5206 39.3014 3.89916 39.6288 4.33802 39.6288H37.6612C38.1001 39.6288 38.4787 39.3014 38.5418 38.871L41.9895 16.1194C42.0294 15.8621 41.9551 15.6013 41.7855 15.4036ZM4.20622 1.77333H13.624L15.3661 4.67633C15.5883 5.04788 15.9956 5.27853 16.4289 5.27853H37.8561V15.0931H37.1551V12.2889H36.4541V10.1858H35.753V8.08268H6.30934V10.1858H5.6083V12.2889H4.90726V15.0931H4.20622V1.77333ZM6.30934 13.691H35.753V15.0931H6.30934V13.691ZM7.01038 11.5879H35.052V12.2889H7.01038V11.5879ZM34.3509 10.1858H7.71142V9.48477H34.3509V10.1858ZM37.2217 38.2274H4.77757L1.48548 16.4952H2.80414H4.90726H37.1551H39.2582H40.5145L37.2217 38.2274Z"
            fill="#808080"
          />
        </svg>
      )
    }

    if (type == 2)
    {
      return (
        <svg viewBox="0 0 44 40" fill="none">
          <path d="M42.8456 15.6849C42.6794 15.4857 42.4341 15.3688 42.1734 15.3652L40.3228 15.3402L40.4576 5.36324C40.4669 4.67979 39.9185 4.1164 39.235 4.10717L17.7389 3.81671L16.0362 0.890436C15.819 0.515916 15.4149 0.279792 14.9817 0.273939L5.3096 0.14325C4.62684 0.134726 4.06345 0.683089 4.05423 1.36584L3.87207 14.847L1.95841 14.8212C1.69905 14.8176 1.45148 14.9272 1.27989 15.1212C1.1076 15.3152 1.02838 15.5742 1.06414 15.8334L4.20345 38.6294C4.26139 39.0635 4.63549 39.396 5.0743 39.4019L38.3945 39.8521C38.8333 39.858 39.2163 39.5358 39.2852 39.1062L43.0399 16.4034C43.0834 16.1466 43.0126 15.8849 42.8456 15.6849ZM5.45397 1.54811L14.8709 1.67535L16.5736 4.60163C16.7908 4.97615 17.1949 5.21227 17.6281 5.21813L39.0535 5.50762L38.9209 15.3213L38.2199 15.3118L38.2578 12.5079L37.5568 12.4984L37.5852 10.3955L36.8842 10.386L36.9126 8.28311L7.47166 7.88531L7.44324 9.98824L6.74227 9.97876L6.71385 12.0817L6.01288 12.0722L5.97499 14.8761L5.27401 14.8667L5.45397 1.54811ZM7.39588 13.4931L36.8369 13.8909L36.8179 15.2929L7.37694 14.8951L7.39588 13.4931ZM8.12528 11.3997L36.1643 11.7785L36.1548 12.4795L8.1158 12.1006L8.12528 11.3997ZM35.4823 10.3671L8.84519 10.0072L8.85467 9.3062L35.4918 9.66612L35.4823 10.3671ZM37.9739 38.4449L5.53275 38.0066L2.53458 16.2318L3.85312 16.2497L5.95605 16.2781L38.2009 16.7138L40.3039 16.7422L41.56 16.7592L37.9739 38.4449Z" fill="#FF9900" />
          <path d="M22 21C18.1403 21 15 24.1403 15 28C15 31.8597 18.1403 35 22 35C25.8597 35 29 31.8597 29 28C29 24.1403 25.8597 21 22 21ZM22 34.125C18.6226 34.125 15.875 31.3774 15.875 28C15.875 24.6226 18.6226 21.875 22 21.875C25.3774 21.875 28.125 24.6226 28.125 28C28.125 31.3774 25.3774 34.125 22 34.125Z" fill="#FF9900" />
          <path d="M22.4375 23.625H21.5625V28.1811L24.3157 30.9343L24.9343 30.3157L22.4375 27.8188V23.625Z" fill="#FF9900" />
        </svg>
      )
    }

    if (type == 3)
    {
      return (
        <svg viewBox="0 0 42 40" fill="none">
          <path d="M41.7855 15.4036C41.6165 15.2067 41.3697 15.0931 41.109 15.0931H39.2582V5.11518C39.2582 4.43167 38.7023 3.87574 38.0188 3.87574H16.5207L14.7786 0.972738C14.5564 0.601186 14.1491 0.370544 13.7158 0.370544H4.04288C3.36006 0.371245 2.80414 0.92717 2.80414 1.60998V15.0924H0.890301C0.630916 15.0924 0.384851 15.2052 0.215901 15.4015C0.046249 15.5978 -0.0294633 15.8579 0.00979493 16.1166L3.45681 38.8681C3.5206 39.3014 3.89916 39.6288 4.33802 39.6288H37.6612C38.1001 39.6288 38.4787 39.3014 38.5418 38.871L41.9895 16.1194C42.0294 15.8621 41.9551 15.6013 41.7855 15.4036ZM4.20622 1.77333H13.624L15.3661 4.67633C15.5883 5.04788 15.9956 5.27853 16.4289 5.27853H37.8561V15.0931H37.1551V12.2889H36.4541V10.1858H35.753V8.08268H6.30934V10.1858H5.6083V12.2889H4.90726V15.0931H4.20622V1.77333ZM6.30934 13.691H35.753V15.0931H6.30934V13.691ZM7.01038 11.5879H35.052V12.2889H7.01038V11.5879ZM34.3509 10.1858H7.71142V9.48477H34.3509V10.1858ZM37.2217 38.2274H4.77757L1.48548 16.4952H2.80414H4.90726H37.1551H39.2582H40.5145L37.2217 38.2274Z" fill="#0085FF" />
          <path d="M29.25 29.366C29.0602 29.366 28.9062 29.5199 28.9062 29.7098V32.1184H28.3593C28.2246 30.9262 27.1488 30.0689 25.9566 30.2037C24.95 30.3175 24.1557 31.1118 24.0418 32.1184H16.875V22.1497H28.9062V23.2308C28.9062 23.4206 29.0602 23.5745 29.25 23.5745C29.4398 23.5745 29.5938 23.4206 29.5938 23.2308V21.8059C29.5938 21.6161 29.4398 21.4622 29.25 21.4622H16.5312C16.3414 21.4622 16.1875 21.6161 16.1875 21.8059V22.1497H12.2509C11.3879 22.1508 10.6886 22.8501 10.6875 23.713V24.2122C10.6875 24.402 10.8414 24.5559 11.0312 24.5559H11.431L11.1688 27.7064C10.4823 27.885 10.0024 28.5037 10 29.213V32.1184C10 32.3083 10.1539 32.4622 10.3438 32.4622H11.0398C11.1341 33.6914 12.207 34.6116 13.4363 34.5173C14.5345 34.4331 15.4072 33.5604 15.4914 32.4622C15.4945 32.4622 15.4969 32.4639 15.5 32.4639H16.1875C16.1875 32.6537 16.3414 32.8076 16.5312 32.8076H24.0731C24.318 33.9826 25.4691 34.7366 26.644 34.4917C27.4904 34.3153 28.1517 33.654 28.3281 32.8076H29.25C29.4398 32.8076 29.5938 32.6537 29.5938 32.4639V29.7098C29.5938 29.5199 29.4398 29.366 29.25 29.366ZM13.2656 33.8372C12.4113 33.8372 11.7188 33.1446 11.7188 32.2903C11.7188 31.436 12.4113 30.7434 13.2656 30.7434C14.1199 30.7434 14.8125 31.436 14.8125 32.2903C14.8116 33.1442 14.1195 33.8362 13.2656 33.8372ZM16.1875 31.7747H15.5C15.4798 31.7768 15.4599 31.7808 15.4405 31.7867C15.1641 30.5856 13.9663 29.836 12.7652 30.1125C11.937 30.3031 11.289 30.9476 11.0938 31.7747H10.6875V29.213C10.6881 28.7296 11.0799 28.3377 11.5634 28.3372H16.1875V31.7747ZM16.1875 27.6497H11.8631L12.1209 24.5559H16.1875V27.6497ZM16.1875 23.8684H11.375V23.713C11.3756 23.2296 11.7674 22.8377 12.2509 22.8372H16.1875V23.8684ZM27.684 32.4484C27.6398 33.2348 26.9886 33.8495 26.2009 33.8482H26.2006C25.4794 33.8466 24.8635 33.3271 24.7403 32.6165C24.8006 32.5112 24.7937 32.3804 24.7228 32.282C24.7687 31.4643 25.4689 30.8387 26.2866 30.8846C27.1043 30.9305 27.73 31.6307 27.684 32.4484Z" fill="#0085FF" />
          <path d="M28.9062 24.2122H24.0938C23.9039 24.2122 23.75 24.3661 23.75 24.5559C23.75 24.7457 23.9039 24.8997 24.0938 24.8997H28.9062C29.0961 24.8997 29.25 24.7457 29.25 24.5559C29.25 24.3661 29.0961 24.2122 28.9062 24.2122Z" fill="#0085FF" />
          <path d="M29.5938 27.9934H22.0312C21.8414 27.9934 21.6875 28.1473 21.6875 28.3372C21.6875 28.527 21.8414 28.6809 22.0312 28.6809H29.5938C29.7836 28.6809 29.9375 28.527 29.9375 28.3372C29.9375 28.1473 29.7836 27.9934 29.5938 27.9934Z" fill="#0085FF" />
          <path d="M28.9062 25.9309H25.125C24.9352 25.9309 24.7812 26.0848 24.7812 26.2747C24.7812 26.4645 24.9352 26.6184 25.125 26.6184H28.9062C29.0961 26.6184 29.25 26.4645 29.25 26.2747C29.25 26.0848 29.0961 25.9309 28.9062 25.9309Z" fill="#0085FF" />
          <path d="M30.2812 24.8997H30.9688C31.1586 24.8997 31.3125 24.7457 31.3125 24.5559C31.3125 24.3661 31.1586 24.2122 30.9688 24.2122H30.2812C30.0914 24.2122 29.9375 24.3661 29.9375 24.5559C29.9375 24.7457 30.0914 24.8997 30.2812 24.8997Z" fill="#0085FF" />
          <path d="M31.3125 27.9934H30.625C30.4352 27.9934 30.2812 28.1473 30.2812 28.3372C30.2812 28.527 30.4352 28.6809 30.625 28.6809H31.3125C31.5023 28.6809 31.6562 28.527 31.6562 28.3372C31.6562 28.1473 31.5023 27.9934 31.3125 27.9934Z" fill="#0085FF" />
          <path d="M31.6562 25.9309H30.2812C30.0914 25.9309 29.9375 26.0848 29.9375 26.2747C29.9375 26.4645 30.0914 26.6184 30.2812 26.6184H31.6562C31.8461 26.6184 32 26.4645 32 26.2747C32 26.0848 31.8461 25.9309 31.6562 25.9309Z" fill="#0085FF" />
        </svg>
      )
    }

    if (type == 4 || type == 5)
    {
      const color = type == 4 ? "#49AE26" : "#808080"
      return (
        <svg viewBox="0 0 42 40" fill="none">
          <path d="M41.7855 15.4036C41.6165 15.2067 41.3697 15.0931 41.109 15.0931H39.2582V5.11518C39.2582 4.43167 38.7023 3.87574 38.0188 3.87574H16.5207L14.7786 0.972738C14.5564 0.601186 14.1491 0.370544 13.7158 0.370544H4.04288C3.36006 0.371245 2.80414 0.92717 2.80414 1.60998V15.0924H0.890301C0.630916 15.0924 0.384851 15.2052 0.215901 15.4015C0.046249 15.5978 -0.0294633 15.8579 0.00979493 16.1166L3.45681 38.8681C3.5206 39.3014 3.89916 39.6288 4.33802 39.6288H37.6612C38.1001 39.6288 38.4787 39.3014 38.5418 38.871L41.9895 16.1194C42.0294 15.8621 41.9551 15.6013 41.7855 15.4036ZM4.20622 1.77333H13.624L15.3661 4.67633C15.5883 5.04788 15.9956 5.27853 16.4289 5.27853H37.8561V15.0931H37.1551V12.2889H36.4541V10.1858H35.753V8.08268H6.30934V10.1858H5.6083V12.2889H4.90726V15.0931H4.20622V1.77333ZM6.30934 13.691H35.753V15.0931H6.30934V13.691ZM7.01038 11.5879H35.052V12.2889H7.01038V11.5879ZM34.3509 10.1858H7.71142V9.48477H34.3509V10.1858ZM37.2217 38.2274H4.77757L1.48548 16.4952H2.80414H4.90726H37.1551H39.2582H40.5145L37.2217 38.2274Z" fill={color} />
          <path d="M14 27L19 32L28.5 22.5" stroke={color} />
        </svg>
      )
    }
  }

  handleSelDoc = (document, selAll) =>
  {
    let {selDocs} = this.state;

    if (!document)
    {
      if (selAll)
      {
        this.state.selDocs = [];
      }
      else 
      {
        this.state.selDocs = this.getArrCopy(this.state.folderViewObject.documents);
      }
    }
    else 
    {
      if (!selDocs.length || !selDocs.some(sD => {return sD.id == document.id}))
      {
        selDocs.push(Object.assign({}, document));
      }
      else 
      {
        this.state.selDocs = selDocs.filter(sD => sD.id != document.id);
      }
    }

    this.forceUpdate();
  }

  handleChangeDocType = (ev, doc, isCopy) =>
  {
    let {selDocs} = this.state;

    ev.preventDefault();
    ev.stopPropagation();

    doc.isCopy = isCopy ? 1 : 0;

    selDocs.length && selDocs.some(sD => 
    {
      if (sD.id == doc.id)
      {
        sD.isCopy = isCopy ? 1 : 0;
      }
    })

    this.forceUpdate();
  }

  createRegister = async (ev) =>
  {
    let {selDocs, registers, folderViewObject, regParams} = this.state;

    ev.preventDefault();

    folderViewObject.documents.forEach(doc =>
    {
      if (selDocs.some(sD => {return sD.id == doc.id}))
      {
        doc.registers += ", " + (registers.length + 1);
      }

      doc.isCopy = undefined;
    })

    let data = {
      bill: {
        id: folderViewObject.id,
        pdf: {
          type: 1,
          num: registers.length + 1,
          docs: selDocs.map(doc => {return {id: doc.id, copy: doc.isCopy || undefined}}),
          get: regParams[0] ? 1 : undefined,
          newSend: regParams[1] ? 1 : undefined,
        }
      }
    };

    this.state.createRegLoader = true;

    this.forceUpdate();

    data = await this.getData("/ParseBills", data);

    if (data.success)
    {
      const {lang} = this.state;

      const statuses = this.getArrCopy(regStats);

      statuses[0].on = 1;
      statuses[0].date = data.date ? this.getCurrDateTime(data.date) : "";

      statuses.reverse();

      this.state.registers.push({
        name: lang[langData.register] + " " + lang[langData.ofTransmission] + " " + lang[langData.numSymbol] + (registers.length + 1),
        statuses,
        url: data.url || "",
        docUrl: data.docUrl || ""
      });

      this.state.selDocs = [];
      this.state.createRegLoader = false;

      this.forceUpdate()
    }
    else 
    {
      this.changeViewMode(view.none);
    }
  }

  getArrCopy = (array) =>
  {
    let arrCopy = [];

    array.forEach(object =>
    {
      const item = Object.assign({}, object);
      arrCopy.push(item)
    })

    return arrCopy;
  }

  startEdit = (ev) =>
  {
    ev.preventDefault();

    this.state.isEdit = true;
    this.state.folderCopy = this.getObjectCopy(this.state.folderViewObject);

    window.history.replaceState({viewMode: view.folderView}, "", "?PID=" + this.state.folderViewObject.id + "&v=1");

    this.fillNavigations()
    this.forceUpdate();
  }

  renderDocSvg = () =>
  {
    return (
      <svg viewBox="0 0 128 128">
        <path d="M104,126H24c-5.5,0-10-4.5-10-10V12c0-5.5,4.5-10,10-10h40.7c2.7,0,5.2,1,7.1,2.9l39.3,39.3c1.9,1.9,2.9,4.4,2.9,7.1V116C114,121.5,109.5,126,104,126z M24,6c-3.3,0-6,2.7-6,6v104c0,3.3,2.7,6,6,6h80c3.3,0,6-2.7,6-6V51.3c0-1.6-0.6-3.1-1.8-4.2L68.9,7.8C67.8,6.6,66.3,6,64.7,6H24z" />
        <path d="M49.3,58h12c12.5,0,18.1,6.1,18.1,18.4c0,9.8-3.9,20.1-18,20.1H49.3V58z M57.6,89.5h3.1c7.8,0,10.1-5,10.1-12.4c0-9.3-4.1-12.2-10.1-12.2h-3V89.5z" />
      </svg>
    )
  }

  saveSettings = async (status) =>
  {
    const {regParams, selType} = this.state;

    const settings = {
      regs: (regParams[0] ? 1 : "") + "|" + (regParams[1] ? 1 : ""),
      status: selType ?.id || undefined
    };

    let data = {
      settings: JSON.stringify(settings),
      status: status >= 0 ? status : undefined
    };

    if (status >= 0)
    {
      this.changeViewMode(view.loader);

      await this.sleep(500);
    }

    data = await this.getData("/ParseBills", data);

    if (!data.success)
    {
      this.changeViewMode(view.none);

      return;
    }

    this.state.folderTypesArr = data.bills ? this.prepareFoldersData(data.bills) : [];

    if (status >= 0)
    {
      this.state.isClickOnStat = false;

      this.changeViewMode(view.foldersView);
    }
  }

  getTitle = (elem) =>
  {
    if (!elem) return;

    const textCont = elem ?.children[1] ?.children[0] || null;

    if (!textCont || !textCont.innerText) return;

    const clW = textCont.clientWidth;
    const text = textCont.innerText;

    textCont.style.width = "auto";

    const textW = textCont.clientWidth;

    textCont.style = "";

    if (textW > clW)
    {
      elem.title = text;
    }
  }

  render()
  {
    const {viewMode, lang, popupText, selType, folderTypesArr, selWayID, isClickOnStat} = this.state;

    if (viewMode == view.none) return null;

    return (
      <>

        <div className={"loader-ring" + (viewMode != view.loader ? " none" : "")}>
          <div /><div /><div />
        </div>

        <div className={"header" + (viewMode != view.foldersView && !isClickOnStat ? " none" : "") + (isClickOnStat ? " block" : "")}>
          <a
            href="#"
            className="add-folder"
            onClick={(ev) => this.addFolder(ev)}
          >
            <div>{lang[langData.plus]}</div>
            <div>{lang[langData.add]}</div>
          </a>
          <div className="statuses-cont">
            <a
              href="#"
              className="filter-btn"
              onClick={(ev) => {ev.preventDefault()}}
            >
              <svg width="16" height="15" viewBox="0 0 16 15" fill="none">
                <path d="M15.2913 0.963707L9.38641 7.3417V12.388C9.38641 12.5632 9.2988 12.7209 9.14111 12.8085L6.75812 14.0876C6.44273 14.2629 6.05724 14.0351 6.05724 13.6671V7.35922L0.152342 0.963707C-0.180576 0.595746 0.0647321 0 0.572869 0H14.8533C15.3614 0 15.6242 0.595746 15.2913 0.963707Z" fill="#C8C8C8" />
              </svg>
            </a>
            {
              statuses.map((stat, index) =>
              {
                return (
                  <a
                    key={index}
                    href="#"
                    className={"stat-btn" + currStats[index] + (selType && selType.id == stat.id ? " sel" : "")}
                    onClick={(ev) => this.setSelStat(ev, stat)}
                  >{stat.name}</a>
                )
              })
            }
          </div>
        </div>

        <div
          // noHist={1}
          className={"folders-cont" + (viewMode != view.foldersView || !folderTypesArr.length ? " none" : "")}
        >
          <br />
          <br />
          {

            folderTypesArr.map((typeObj, index) =>
            {
              if (selType && typeObj.folders && typeObj.folders.length && !typeObj.folders.some(fold => selType.id == fold.status)) return null;

              return (
                <React.Fragment key={index}>
                  <div className="type-name">{typeObj.name}</div>
                  <div className="folders">
                    {
                      typeObj.folders.map(folder =>
                      {
                        return (
                          <a
                            key={folder.id}
                            href="#"
                            ref={this.getTitle}
                            className="folder-btn"
                            onClick={(ev) => {this.openFolder(folder, ev)}}
                          >
                            {this.renderSvg(folder.status)}

                            <div className="fold-info">
                              <div className="name">{folder.name}</div>
                              {
                                folder.docCount ?
                                  <div className="docs-count">{this.getCurrCount("" + folder.docCount)}</div>
                                  : null
                              }
                            </div>
                          </a>
                        )
                      })
                    }
                  </div>
                </React.Fragment>
              )
            })

          }
        </div>


        <div className={"folder-data" + (viewMode != view.folderView || selWayID ? " none" : "")}>

          <FolderData />

        </div>

        <div className={"doc-registers-cont" + (viewMode != view.folderView || selWayID != 1 ? " none" : "")}>

          <RegistersData />

        </div>

        {
          (viewMode == view.foldersView && !folderTypesArr.length) || selWayID > 1 ?
            <div className="err-way">
              {
                !folderTypesArr.length ?
                  lang[langData.document][0].toUpperCase() + lang[langData.document].substr(1) + lang[langData.s] + " " + lang[langData.notFound]
                  :
                  lang[langData.thisMethodIsNotYetSupported]
              }
            </div>
            : null
        }
        {
          popupText ?
            <div
              className="errGlobal bl"
              ref={this.popupRef}
            >
              <div className="cont">
                <img alt="" className="errGlobal-img1" src="/images/login/notice.png" />
                <div className="errGlobal-ch1">{popupText}</div>
                <a
                  className="errBtn"
                  onClick={(ev) => this.restoreDelFile(ev)}
                >{lang[langData.reestablish]}</a>
                <img
                  alt=""
                  className="errGlobal-img2"
                  src="/images/login/close.png"
                  onClick={() => this.closeModal()}
                />
              </div>
            </div>
            : null
        }

      </>
    )
  }
}