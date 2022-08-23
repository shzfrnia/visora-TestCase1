import React, {Component} from 'react'
import {langData, lilArr, registers, statuses} from '../constants'
import TasksDesk from './MainContainer'

let isFirstStepDone = false;
let isSecStepDone = false;

export default class RegistersData extends Component
{
  renderDoneSvg = () =>
  {
    return (
      <svg viewBox="0 0 512 512">
        <path d="M223.9,329.7c-2.4,2.4-5.8,4.4-8.8,4.4s-6.4-2.1-8.9-4.5l-56-56l17.8-17.8l47.2,47.2l124.8-125.7l17.5,18.1L223.9,329.7z" />
      </svg>
    )
  }

  renderBtns = (doc, ind) =>
  {
    const isSel = ind && doc.isCopy || !ind && !doc.isCopy;
    const text = TasksDesk.this.state.lang[ind ? langData.copy : langData.original];

    return (
      <a
        key={ind}
        href="#"
        className={"link-new" + (isSel ? "-sel" : "")}
        onClick={(ev) => TasksDesk.this.handleChangeDocType(ev, doc, ind)}
      >{text}</a>
    )
  }

  changeRegParam = (ev, index) =>
  {
    ev.preventDefault();

    TasksDesk.this.state.regParams[index] = !TasksDesk.this.state.regParams[index];

    TasksDesk.this.setDelay(() =>
    {
      TasksDesk.this.saveSettings();
    })

    this.forceUpdate();
  }

  render()
  {
    const {folderViewObject, selDocs, createRegLoader, regParams, lang} = TasksDesk.this.state;
    let documentRegisters = [];
    folderViewObject.documents.forEach(d => d.registers.forEach(r => documentRegisters.push(r)));
    documentRegisters = [...new Set(documentRegisters)];
    const folderRegisters = documentRegisters
      .sort()
      .map(el => ({
        ...registers[0],
        name: registers[0].name + el,
        id: el,
        status: TasksDesk.this.getRandomIntInclusive(0, statuses.length)
      }))
    return (
      <>

        <div className="step">
          <div className={"number" + (isFirstStepDone ? " done" : "")}>
            {isFirstStepDone ? this.renderDoneSvg() : lang[langData.oneNum]}
          </div>

          <div className={"content" + (isFirstStepDone ? " done" : "")}>

            <div className="head">{lang[langData.formation] + " " + lang[langData.register].toLowerCase() + lang[langData.u] + " " + lang[langData.ofTransmission]}</div>

            <table className="commonTb">
              <tbody>
                <tr className="commonTb-head">
                  <th onClick={() => TasksDesk.this.handleSelDoc(null, folderViewObject.documents.length == selDocs.length)}>
                    <div className={"cb-new" + (folderViewObject.documents.length == selDocs.length ? " on" : "")} />
                  </th>
                  <th>{lang[langData.document][0].toUpperCase() + lang[langData.document].substr(1)}</th>
                  <th>{lang[langData.whatWeTransfer]}</th>
                  <th>{lang[langData.inWhichRegister]}</th>
                  <th>{lang[langData.currStatus]}</th>
                </tr>
                {
                  folderViewObject.documents.map((doc, index) =>
                  {
                    const regs = doc.registers.map(r => folderRegisters.filter(el => el.id == r)[0]);
                    let maxStatusReg = regs[0]
                    regs.forEach(r => {
                      if (r.status > maxStatusReg.status) {
                        maxStatusReg = r;
                      }
                    })
                    const status = maxStatusReg.statuses[
                      maxStatusReg.status > 0 ? maxStatusReg.status - 1 : maxStatusReg.status
                    ].name;
                    return (
                      <tr
                        key={index}
                        className="commonTb-row"
                        style={createRegLoader ? {pointerEvents: "none"} : null}
                        onClick={() => TasksDesk.this.handleSelDoc(doc)}
                      >
                        <td>
                          <div className={"cb-new" + (selDocs.length && selDocs.some(sD => {return sD.id == doc.id}) ? " on" : "")} />
                        </td>
                        <td>
                          <div className="td-content">{doc.name}</div>
                        </td>
                        <td>
                          <div className="l-round clients-views">
                            {
                              lilArr.map((b, ind) => {return this.renderBtns(doc, ind)})
                            }
                          </div>
                        </td>
                        <td>
                          {doc.registers.join(', ')}
                        </td>
                        <td>{status}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>

            <a
              href="#"
              className={"link-new" + (selDocs.length ? " l-green" : "")}
              style={!selDocs.length || createRegLoader ? {pointerEvents: "none"} : null}
              onClick={(ev) => TasksDesk.this.createRegister(ev)}
            >{lang[langData.toForm] + " " + lang[langData.register].toLowerCase() + " " + lang[langData.ofTransmission]}</a>

            <div className="loader-cont">
              <div className={"loader-ring mini" + (!createRegLoader ? " none" : "")}>
                <div /><div /><div />
              </div>
            </div>

            <div className="reg-params">
              {
                regParams.map((param, ind) =>
                {
                  return (
                    <a
                      key={ind}
                      href="#"
                      className={"cb-new" + (param ? " on" : "")}
                      onClick={(ev) => this.changeRegParam(ev, ind)}
                    >
                      {!ind ? lang[langData.enableSelectionSheet] : (lang[langData.oneRecipientOfAll] + " " + lang[langData.document] + lang[langData.ov])}
                    </a>
                  )
                })
              }
            </div>

          </div>

        </div>

        <div className={"step" + (!folderViewObject.documents.length ? " none" : "")}>

          <div className={"number" + (isSecStepDone ? " done" : "")}>
            {isSecStepDone ? this.renderDoneSvg() : 2}
          </div>

          <div className={"content" + (isSecStepDone ? " done" : "")}>

            <div className="head">{lang[langData.prepared] + " " + lang[langData.register].toLowerCase() + lang[langData.s] + " " + lang[langData.ofTransmission]}</div>

            <div className="registers-cont">
              {
                folderRegisters.map((reg, index) =>
                {
                  return (
                    <div
                      key={index}
                      className="register"
                    >
                      <a
                        href={reg.url}
                        className="reg-btn"
                      >
                        <svg viewBox="0 0 128 128">
                          <path d="M104,126H24c-5.514,0-10-4.486-10-10V12c0-5.514,4.486-10,10-10h40.687c2.671,0,5.183,1.041,7.07,2.929l39.314,39.314c1.889,1.889,2.929,4.399,2.929,7.07V116C114,121.514,109.514,126,104,126z M24,6c-3.309,0-6,2.691-6,6v104c0,3.309,2.691,6,6,6h80c3.309,0,6-2.691,6-6V51.313c0-1.579-0.641-3.125-1.757-4.242L68.929,7.757C67.796,6.624,66.289,6,64.687,6H24z" />
                          <path d="M95.21,80.32c-0.07-0.51-0.48-1.15-0.92-1.58c-1.26-1.24-4.03-1.89-8.25-1.95c-2.86-0.03-6.3,0.22-9.92,0.73c-1.62-0.93-3.29-1.95-4.6-3.18c-3.53-3.29-6.47-7.86-8.31-12.89c0.12-0.47,0.22-0.88,0.32-1.3c0,0,1.98-11.28,1.46-15.1c-0.07-0.52-0.12-0.67-0.26-1.08l-0.17-0.44c-0.54-1.25-1.6-2.57-3.26-2.5L60.32,41H60.3c-1.86,0-3.36,0.95-3.76,2.36c-1.2,4.44,0.04,11.09,2.29,19.69l-0.58,1.4c-1.61,3.94-3.63,7.9-5.41,11.39l-0.23,0.45c-1.88,3.67-3.58,6.79-5.13,9.43l-1.59,0.84c-0.12,0.06-2.85,1.51-3.49,1.89c-5.43,3.25-9.03,6.93-9.63,9.85c-0.19,0.94-0.05,2.13,0.92,2.68l1.54,0.78c0.67,0.33,1.38,0.5,2.1,0.5c3.87,0,8.36-4.82,14.55-15.62c7.14-2.32,15.28-4.26,22.41-5.32c5.43,3.05,12.11,5.18,16.33,5.18c0.75,0,1.4-0.07,1.92-0.21c0.81-0.22,1.49-0.68,1.91-1.3C95.27,83.76,95.43,82.06,95.21,80.32z M36.49,99.33c0.7-1.93,3.5-5.75,7.63-9.13c0.26-0.21,0.9-0.81,1.48-1.37C41.28,95.72,38.39,98.46,36.49,99.33z M60.95,43c1.24,0,1.95,3.13,2.01,6.07c0.06,2.94-0.63,5-1.48,6.53c-0.71-2.26-1.05-5.82-1.05-8.15C60.43,47.45,60.38,43,60.95,43z M53.65,83.14c0.87-1.55,1.77-3.19,2.69-4.92c2.25-4.25,3.67-7.57,4.72-10.3c2.1,3.82,4.72,7.07,7.79,9.67c0.39,0.32,0.8,0.65,1.22,0.98C63.82,79.8,58.41,81.31,53.65,83.14z M93.08,82.79c-0.38,0.23-1.47,0.37-2.17,0.37c-2.26,0-5.07-1.03-9-2.72c1.51-0.11,2.9-0.17,4.14-0.17c2.27,0,2.94-0.01,5.17,0.56C93.44,81.4,93.47,82.55,93.08,82.79z" />
                        </svg>

                        <div className="reg-name">{reg.name}</div>

                      </a>

                      <div className="stat-cont">
                        {
                          reg.statuses.map((stat,index) =>
                          {
                            stat.done = reg.status > index;
                            return (
                              <div
                                key={stat.id}
                                className={"status" + (stat.on ? " on" : stat.done ? " done" : "")}
                              >
                                <div className="svg-cont">
                                  {
                                    stat.on || stat.done ?
                                      <svg viewBox="0 0 11 9">
                                        <path d="M1 4L4 7L10 1" strokeWidth="2" />
                                      </svg>
                                      :
                                      <svg viewBox="0 0 4 4">
                                        <circle cx="2" cy="2" r="2" />
                                      </svg>
                                  }
                                </div>
                                <i>{stat.name}</i>
                                <i>{stat.date || ""}</i>
                              </div>
                            )
                          })
                        }
                      </div>

                      <a
                        href="#"
                        className="handle-reg"
                      >
                        {lang[langData.hanlde] + " " + lang[langData.register].toLowerCase()}
                        <svg viewBox="0 0 15 15">
                          <path d="M6.37132 1.00002L12.7426 7.37134L6.37132 13.7427" />
                        </svg>
                      </a>

                    </div>
                  )
                })
              }
            </div>
          </div>

        </div>

      </>
    )
  }
}