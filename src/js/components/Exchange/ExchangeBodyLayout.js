import React from "react"
import { NavLink } from 'react-router-dom'
import { roundingNumber, toEther } from "../../utils/converter"
import { Link } from 'react-router-dom'
import constants from "../../services/constants"
import ReactTooltip from 'react-tooltip'
import { filterInputNumber } from "../../utils/validators";
import { ImportAccount } from "../../containers/ImportAccount";
import { PostExchangeWithKey } from "../../containers/Exchange";
import BLOCKCHAIN_INFO from "../../../../env";
import { RateBetweenToken } from "../../containers/Exchange";
import * as converters from "../../utils/converter";
import { getAssetUrl } from "../../utils/common";
import BigInput from "./BigInput";
import { TermAndServices } from "../../containers/CommonElements";

const ExchangeBodyLayout = (props) => {
  function handleChangeSource(e) {
    var check = filterInputNumber(e, e.target.value, props.input.sourceAmount.value)
    if (check) props.input.sourceAmount.onChange(e)
  }

  function handleChangeDest(e) {
    var check = filterInputNumber(e, e.target.value, props.input.destAmount.value)
    if (check) props.input.destAmount.onChange(e)
  }

  var errorSelectSameToken = props.errors.selectSameToken !== '' ? props.translate(props.errors.selectSameToken) : ''
  var errorSelectTokenToken = props.errors.selectTokenToken !== '' ? props.translate(props.errors.selectTokenToken) : ''
  var errorToken = errorSelectSameToken + errorSelectTokenToken
  var maxCap = props.maxCap
  var errorSource = []
  var errorExchange = false

  if (props.errorNotPossessKgt !== "") {
    errorSource.push(props.errorNotPossessKgt)
    errorExchange = true
  } else {
    if (props.errors.exchange_enable !== "") {
      errorSource.push(props.translate(props.errors.exchange_enable))
      errorExchange = true
    } else {
      if (errorToken !== "") {
        errorSource.push(errorToken)
        errorExchange = true
      }
      if (props.errors.sourceAmount !== "") {
        if (props.errors.sourceAmount === "error.source_amount_too_high_cap") {
          if (props.sourceTokenSymbol === "ETH") {
            errorSource.push(props.translate("error.source_amount_too_high_cap", { cap: maxCap }))
          } else {
            errorSource.push(props.translate("error.dest_amount_too_high_cap", { cap: maxCap * constants.MAX_CAP_PERCENT }))
          }
        } else if (props.errors.sourceAmount === "error.source_amount_too_small") {
          errorSource.push(props.translate("error.source_amount_too_small", { minAmount: toEther(constants.EPSILON) }))
        } else {
          errorSource.push(props.translate(props.errors.sourceAmount))
        }
        errorExchange = true
      }
      if (props.errors.rateSystem !== "") {
        errorSource.push(props.translate(props.errors.rateSystem))
        errorExchange = true
      }
    }
  }

  var errorShow = errorSource.map((value, index) => {
    return <span class="error-text" key={index}>{value}</span>
  })

  function getWalletName() {
    if (props.walletName === "") {
      switch(props.account.type) {
        case "metamask":
          return "METAMASK"
        case "keystore":
          return "JSON"
        case "ledger":
          return "LEDGER"
        case "trezor":
          return "TREZOR"
        case "privateKey":
          return "PRIVATE KEY"
        case "promoCode":
          return "PROMO CODE"
        default:
          return "WALLET"
      }
    } else {
      return props.walletName
    }
  }

  function getWalletIconName(type, walletName) {
    if (walletName === "PROMO CODE") {
      return "promo_code";
    }

    return type;
  }

  function getAccountTypeHtml(onMobile = false) {
    return (
      <div className={`import-account__wallet-type ${onMobile ? "mobile" : ""}`}>
        <img className="import-account__wallet-image" src={getAssetUrl(`wallets/${getWalletIconName(props.account.type, props.walletName)}.svg`)}/>
        <div className="import-account__wallet-content">
          <span className="import-account__wallet-title">Your Wallet - </span>
          <span className="import-account__wallet-name">{getWalletName()}</span>
        </div>
      </div>
    );
  }

  var importAccount = function() {
    if (props.account === false || (props.isChangingWallet && props.changeWalletType === "swap")) {
      return (<ImportAccount
        tradeType="swap"
        isChangingWallet={props.isChangingWallet}
        closeChangeWallet={props.closeChangeWallet}
      />)
    }
    // return (<div className="import-account">
    //   <div className={"import-account__wallet-container container"}>
    //     <div className="import-account__wallet-connect"
    //       onClick={(e) => props.clearSession(e)}>
    //       <div className={"reimport-content"}>Connect other wallet</div>
    //       <div className={"reimport-line"}></div>
    //     </div>
    //     {getAccountTypeHtml()}
    //   </div>
    // </div>)
  }

  return (
    <div>
      <div>
        <div>
          <div className="exchange-content-wrapper">
            {props.networkError !== "" && (
              <div className="network_error">
                <img src={require("../../../assets/img/warning.svg")} />
                {props.networkError}
              </div>
            )}
            <div className={"exchange-content container"}>
              <div className={"exchange-content__item--wrapper"}>
                <div className={"exchange-item-label"}>{props.translate("transaction.exchange_from") || "From"}:</div>
                <div className={"exchange-content__item exchange-content__item--left"}>
                  <div className={`input-div-content ${errorExchange && props.focus === "source" ? "error" : ""}`}>
                    <div className={"exchange-content__label-content"}>
                      {/* <div className="exchange-content__label">{props.translate("transaction.exchange_from") || "From"}</div> */}
                      <div className="exchange-content__select select-token-panel">{props.tokenSourceSelect}</div>
                    </div>
                    <div className={`exchange-content__input-container ${errorExchange ? "error" : ""}`}>
                      <div className={"main-input main-input__left"}>
                        <input
                          className={`exchange-content__input ${props.account !== false ? 'has-account' : ''} ${errorExchange ? "error" : ""}`}
                          min="0"
                          step="0.000001"
                          placeholder="0" autoFocus
                          type="text" maxLength="50" autoComplete="off"
                          value={props.input.sourceAmount.value}
                          onFocus={props.input.sourceAmount.onFocus}
                          onBlur={props.input.sourceAmount.onBlur}
                          onChange={handleChangeSource}
                        />
                        {/* {props.account === false && (
                          <div className={`exchange-content__label exchange-content__label--right ${errorExchange ? "error" : ""}`}>{props.sourceTokenSymbol}</div>
                        )}
                        {props.account !== false && (
                          <div className={`exchange-content__label exchange-content__label--right trigger-swap-modal ${errorExchange ? "error" : ""}`}>{props.swapBalance}</div>
                        )} */}
                      </div>
                      {/* {props.focus === "source" && <div className={errorExchange ? "error-msg error-msg-source" : ""}>
                        {errorShow}
                      </div>} */}
                    </div>
                  </div>
                  {/* {props.focus === "source" && <div className={errorExchange ? "mobile-error__show" : ""}>
                    {errorShow}
                  </div>} */}
                </div>
              </div>

              {/* <div className={"exchange-content__item--absolute"}>
                <span data-tip={props.translate('transaction.click_to_swap') || 'Click to swap'} data-for="swap" currentitem="false">
                  <i className="k k-exchange k-3x cur-pointer" onClick={(e) => props.swapToken(e)}></i>
                </span>
                <ReactTooltip place="bottom" id="swap" type="light"/>
              </div> */}
              <div className={"exchange-content__item--middle"}>
                <span data-tip={props.translate('transaction.click_to_swap') || 'Click to swap'} data-for="swap" currentitem="false">
                  <i className="k k-exchange k-3x cur-pointer" onClick={(e) => props.swapToken(e)}></i>
                </span>
                <ReactTooltip place="bottom" id="swap" type="light"/>
              </div>
              <div className={"exchange-content__item--wrapper"}>
              <div className={"exchange-item-label"}>{props.translate("transaction.exchange_to") || "To"}:</div>
                <div className={"exchange-content__item exchange-content__item--right"}>
                  {/* <div className={`exchange-content__item--absolute exchange-content__item--absolute__mobile  ${errorExchange ? "error" : ""}`}>
                    <span data-tip={props.translate('transaction.click_to_swap') || 'Click to swap'} data-for="swap" currentitem="false">
                      <i className="k k-exchange k-3x cur-pointer" onClick={(e) => props.swapToken(e)}></i>
                    </span>
                    <ReactTooltip place="bottom" id="swap" type="light"/>
                  </div> */}
                  <div className={`input-div-content ${errorExchange ? "error" : ""}`}>
                    <div className={"exchange-content__label-content"}>
                      {/* <div className="exchange-content__label">{props.translate("transaction.exchange_to") || "To"}</div> */}
                      <div className="exchange-content__select select-token-panel">{props.tokenDestSelect}</div>
                    </div>
                    <div className={`exchange-content__input-container ${errorExchange ? "error" : ""}`}>
                      {/* <BigInput 
                        value={props.input.destAmount.value}
                        onFocus={props.input.destAmount.onFocus}
                        onBlur={props.input.destAmount.onBlur}
                        handleChangeValue={handleChangeDest}
                        tokenSymbol={props.destTokenSymbol}
                        type={"dest"}
                        focus={props.focus}
                        errorExchange={errorExchange}
                        errorShow={errorShow}
                        isChangingWallet={props.isChangingWallet}
                      /> */}
                      <div className={"main-input main-input__right"}>
                        <input
                          className={`exchange-content__input ${errorExchange ? "error" : ""}`}
                          step="0.000001"
                          placeholder="0"
                          min="0"
                          type="text"
                          maxLength="50"
                          autoComplete="off"
                          value={props.input.destAmount.value}
                          onFocus={props.input.destAmount.onFocus}
                          onBlur={props.input.destAmount.onBlur}
                          onChange={handleChangeDest}
                        />
                        {/* <div className={`exchange-content__label exchange-content__label--right ${errorExchange ? "error" : ""}`}>{props.destTokenSymbol}</div> */}
                      </div>
                      {props.focus === "dest" && <div className={errorExchange ? "error-msg" : ""}>
                        {/* {!props.isChangingWallet ? props.errorShow : ''} */}
                        {errorShow}
                      </div>}
                    </div>
                  </div>
                  {props.focus === "dest" && <div className={errorExchange ? "mobile-error__show" : "mobile-error"}>
                    {errorShow}
                  </div>}
                </div>
              </div>
            </div>

            <div className="exchange-rate-container container">
              {/* <div className="exchange-rate__balance">
                {(!props.isChangingWallet && props.account !== false) && (
                  <span>
                  <span className="exchange-rate__balance-text">Balance: </span>
                  <span className="exchange-rate__balance-amount">{props.addressBalance.roundingValue}</span>
                </span>
                )}
              </div> */}
              <div className={"exchange-rate-container__left"}>
                <RateBetweenToken
                  isSelectToken={props.exchange.isSelectToken}
                  exchangeRate={{
                    sourceToken: props.sourceTokenSymbol,
                    rate: converters.toT(props.exchange.offeredRate),
                    destToken: props.destTokenSymbol
                  }}
                />
              </div>

              {props.rateToken}
            </div>
           
          </div>
          
          {!props.isAgreedTermOfService && 
            <div className={"exchange-content__accept-term"}>
              <div className={"accept-buttom"} onClick={(e) => props.acceptTerm()}>Swap Now</div>
              <TermAndServices tradeType="swap"/>

              <div className={"list-wallet"}>
                <div className={"list-wallet__item"}>
                  <div className={"item-icon item-icon__metamask"}></div>
                  <div className={"wallet-name"}>METAMASK</div>
                </div>
                <div className={"list-wallet__item"}>
                  <div className={"item-icon item-icon__ledger"}></div>
                  <div className={"wallet-name"}>LEDGER</div>
                </div>
                <div className={"list-wallet__item"}>
                  <div className={"item-icon item-icon__trezor"}></div>
                  <div className={"wallet-name"}>TREZOR</div>
                </div>
                <div className={"list-wallet__item"}>
                  <div className={"item-icon item-icon__keystore"}></div>
                  <div className={"wallet-name"}>KEYSTORE</div>
                </div>
                <div className={"list-wallet__item"}>
                  <div className={"item-icon item-icon__privatekey"}></div>
                  <div className={"wallet-name"}>PRIVATE KEY</div>
                </div>
                <div className={"list-wallet__item"}>
                  <div className={"item-icon item-icon__promocode"}></div>
                  <div className={"wallet-name"}>PROMOCODE</div>
                </div>
              </div>
            </div>
          }

          {props.isAgreedTermOfService && importAccount()}
        </div>

        {props.account !== false && (
          <div className="exchange-account">
            <div className="exchange-account__container container">
              <div className={"reimport-msg"}>Connect other wallet</div>
              <div className="exchange-account__content">
                {getAccountTypeHtml(true)}
                <div className="exchange-account__balance">{props.balanceLayout}</div>
                <div className="exchange-account__adv-config">{props.advanceLayout}</div>
              </div>

              <PostExchangeWithKey isChangingWallet={props.isChangingWallet}/>
            </div>
          </div>
        )}
      </div>

      {props.transactionLoadingScreen}
    </div>
  )
}

export default ExchangeBodyLayout
