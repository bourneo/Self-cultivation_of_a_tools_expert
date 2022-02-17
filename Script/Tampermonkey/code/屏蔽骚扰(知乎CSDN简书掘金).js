// ==UserScript==
// @name         屏蔽骚扰(知乎/CSDN/简书/掘金)
// @namespace    http://tampermonkey.net/
// @version      1.6.2
// @description  屏蔽(知乎：登录弹窗；CSDN：登录弹窗、登录复制；简书：抽奖弹窗；掘金：底部插件下载)
// @author       leekbillow
// @match        https://*.zhihu.com/*
// @match        https://*.blog.csdn.net/*
// @match        https://*.jianshu.com/*
// @match        https://*.juejin.cn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    switch (true) {
        case /\bblog\.csdn\.net\b(?!\.)/.test(location.hostname): {
            // CSDN
            let csdnStyle = document.createElement('style');
            csdnStyle.classList.add('Tampermonkey');
            csdnStyle.innerHTML = `
                  .passport-login-container,
                  #passportbox,
                  .toolbar-advert
                  {
                      display:none!important
                  }
                  code
                  {
                    user-select:text!important;
                  }
                  .hljs-button
                  {
                    display:none!important;
                  }
                `;
            document.head.append(csdnStyle);
            break;
        }
        case /\bzhihu\.com\b(?!\.)/.test(location.hostname): {
            // 知乎
            //添加限制样式
            let bhuStyle = document.createElement('style');
            bhuStyle.classList.add('Tampermonkey');
            bhuStyle.innerHTML = `
                  .Modal-wrapper,
                  .Modal-backdrop,
                  .signFlowModal
                  {
                      display:none!important;
                  }
                `;
            document.head.append(bhuStyle);
            // 弹窗数量，专栏为2
            let rubbishDialogQuantity = 1 + /\bzhuanlan\.zhihu\.com\b(?!\.)/.test(location.hostname), clicked = [];
            // 取消首次自动弹出登录框,解除监听
            let removeStyle = function () {
                    bhuStyle.remove();
                },
                targetNode = document.body,
                observerOptions =
                    {
                        childList: true,
                        subtree: true
                    },
                observer = new MutationObserver(function (mutationList, observer) {
                    let rubbishDialogCloseButtons = document.querySelectorAll('.Modal-closeButton');
                    if (rubbishDialogCloseButtons.length > 0) {
                        [].forEach.call(rubbishDialogCloseButtons, E => {
                            if (clicked.includes(E)) return;
                            E.click();
                            clicked.push(E);
                            if (--rubbishDialogQuantity < 1) {
                                observer.disconnect();
                                let loginButton = document.querySelector('.AppHeader-login');
                                loginButton && (loginButton.onclick = () => removeStyle());
                            }
                        });
                    } else return;
                });
            observer.observe(targetNode, observerOptions);
            //3秒后移除监听
            setTimeout(() => (observer.disconnect(), removeStyle()), 3000);
            break;
        }
        case /\bjianshu\.com\b(?!\.)/.test(location.hostname): {
            // 简书
            let jianshuStyle = document.createElement('style');
            jianshuStyle.classList.add('Tampermonkey');
            jianshuStyle.innerHTML = `
                  ._1aCo37-mask,
                  ._1aCo37-wrap
                  {
                      display:none!important
                  }
                  body
                  {
                      overflow:auto!important
                  }
                `;
            document.head.append(jianshuStyle);
            break;
        }
        case /\bjuejin\.cn\b(?!\.)/.test(location.hostname): {
            // 掘金
            let juejinStyle = document.createElement('style');
            juejinStyle.classList.add('Tampermonkey');
            juejinStyle.innerHTML = `
                  .extension
                  {
                      display:none!important
                  }
                `;
            document.head.append(juejinStyle);
            break;
        }
        default:
            break;
    }
})();
