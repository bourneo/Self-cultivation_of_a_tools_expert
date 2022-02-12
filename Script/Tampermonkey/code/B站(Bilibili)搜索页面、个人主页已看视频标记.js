// ==UserScript==
// @name B站(Bilibili)搜索页面、个人主页已看视频标记
// @version 2.0.2
// @description 在B站搜索结果页面标记哪些视频是已经看过的，直观区分已看和未看的视频。已增加个人主页各页面支持。
// @author Truazusa
// @namespace BiliSearchViewed
// @match https://search.bilibili.com/*
// @match https://space.bilibili.com/*
// @match https://t.bilibili.com/*
// @match https://www.bilibili.com/account/history
// @match https://www.bilibili.com/video/*
// @match https://www.bilibili.com/watchlater/*
// @match https://www.bilibili.com/medialist/play/watchlater*
// @require https://static.hdslb.com/js/jquery.min.js
// @grant unsafeWindow
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_listValues
// ==/UserScript==

var GM_addStyle = GM_addStyle || function (css) {
    var style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.getElementsByTagName("head")[0].appendChild(style);
};

// 增加自定义样式
GM_addStyle(".btnView{opacity:0.8;width:25px;text-align:center;cursor:pointer;display:inline-block;position:absolute;right:0;top:0;z-index:1;border:2px solid #999;border-radius:4px;padding:3px 5px;background:#fff;color:#999;}.btnView:hover{opacity:1;background:#aaa;color:#fff;}");
GM_addStyle(".btnNotView{}");
GM_addStyle(".btnIsView{background:rgba(255,255,255,0.5);opacity:0.2;}.btnIsView:hover{background:rgba(255,255,255,1);opacity:1;color:#999;}");

// 搜索结果页
GM_addStyle(".u-videos .btnView{left:0;top:0;right:unset;}");
GM_addStyle(".video-item{position:relative;}");

// 图文模式
GM_addStyle(".list .btnView{left:0;top:20px;right:unset;}");

GM_addStyle(".btnRefresh{display:inline-block;position:absolute;z-index:1;right:52px;top:17px;background:#fff;border:2px solid #999;border-radius:5px;color:#999;padding:1px 5px;}.btnList:hover{background:#aaa;color:#fff;}");
GM_addStyle(".btnList{display:inline-block;position:absolute;z-index:1;right:97px;top:17px;background:#fff;border:2px solid #999;border-radius:5px;color:#999;padding:1px 5px;}.btnList:hover{background:#aaa;color:#fff;}");
GM_addStyle(".btnListSave{display:inline-block;position:absolute;z-index:1;right:170px;top:17px;background:#fff;border:2px solid #999;border-radius:5px;color:#999;padding:1px 5px;display:none;}.btnListSave:hover{background:#aaa;color:#fff;}");

GM_addStyle(".viewList{width:100%;height:120px;display:none;color:#999;padding:1px 5px;}");

// 别人的空间页：space.bili
GM_addStyle(".small-item .btnView{top:10px;right:unset;z-index:10;}");
GM_addStyle(".btnSpaceRefresh{display:inline-block;cursor:pointer;position:absolute;z-index:1;right:30%;top:19px;background:#fff;border:2px solid #999;border-radius:5px;color:#999;padding:1px 5px;}.btnList:hover{background:#aaa;color:#fff;}");
GM_addStyle(".i-pin-part .content .btnView{right:unset;z-index:10;}");

GM_addStyle(".n-fix .btnSpaceRefresh{}");


// 空间页-动态
GM_addStyle(".video-container .btnView{top:0;right:unset;cursor:pointer;z-index:10;font-size:12px;}");

// 空间页-频道
GM_addStyle(".channel-detail .btnView{top:20px;right:unset;cursor:pointer;z-index:10;}");

// 代表作
GM_addStyle("#i-masterpiece .small-item .btnView{left:10px;top:0;}");

// 收藏页
GM_addStyle(".fav-video-list .small-item .btnView{left:0;top:0;}");

// 顶部进入的动态：t.bili
GM_addStyle(".new-topic-panel .btnSpaceRefresh{position:static;top:0;margin:30px 0 0 0;}");
GM_addStyle(".dyn-topic-panel .btnSpaceRefresh{position:relative;z-index:1;top:10px;right:unset;}");

// 图文模式
GM_addStyle(".list-list .small-item .btnView{left:0;top:20px;right:unset;}");
GM_addStyle(".video .content div.small-item:nth-child(4n+1) .btnView{left:0;right:unset;}");

// 历史页
GM_addStyle(".history-wrap .btnView{left:0;}");
GM_addStyle(".history-wrap .btnRefresh{cursor:pointer;top:3px;right:unset;margin:0 0 0 85px;}");

// 视频观看页
GM_addStyle(".rec-title .btnRefresh{position:unset;font-size:12px;}");
GM_addStyle(".rigth-btn .btnRefresh{position:relative;font-size:12px;line-height:22px;top:0;right:12px;}");
GM_addStyle(".video-data .btnView{position:unset;margin:0 0 0 10px;border:none;}");
GM_addStyle(".video-episode-card__info .btnView{right:0;bottom:0px;position:relative;margin:0 7px 0 0;width:30px;font-size:12px;padding:0px 3px;border:1px solid #999;}");


// 稍后再看页
GM_addStyle(".watch-later-list .btnView{left:50px;}");
GM_addStyle(".watch-later-list .btnRefresh{cursor:pointer;top:3px;right:unset;margin:0 0 0 35px;position:unset;}");

// 稍后再看-视频观看页
GM_addStyle(".tip-info .btnRefresh{font-size:12px;position:absolute;right:0;}");
GM_addStyle(".player-auxiliary-playlist-item{position:relative;}.player-auxiliary-playlist-item .btnView{position:absolute;top:6px;left:65px;}");
GM_addStyle(".player-auxiliary-playlist-item:first-child .btnView{top:0;}");


var setMethod = null;
var isSetView = 0;
var timer = null;
var viewVideoList = null;
var isRefresh = false;
$(document).ready(function () {
    var oldList = GM_getValue("BiliViewed", null);
    if (oldList != null) {
// 对原已看数据列表进行分组
        groupGMVideoList(oldList);
    }
    var domain = location.href;
    var askIndex = domain.indexOf("?");
    if (askIndex > -1) {
        domain = domain.substring(0, askIndex);
    }
    domain = domain.toLowerCase();
    if (domain.indexOf("search.") > -1) {
// 搜索页
        setMethod = setSearchPage;
        checkItemClass = ".video-item";
        coverItemClass = ".lazy-img";
        setSearchPage();
    } else if (domain.indexOf("space.") > -1) {
// 个人空间
        setMethod = setSpacePage;
        var href = location.href;
        href = href.toLowerCase();
        if (href.indexOf("/dynamic") > -1) {
            checkItemClass = ".video-container";
            coverItemClass = ".image-area";
        } else {
            checkItemClass = ".small-item";
            coverItemClass = ".cover";
        }
        setSpacePage();
    } else if (domain.indexOf("t.") > -1) {
// 动态
        setMethod = setSpacePage;
        checkItemClass = ".video-container";
        setSpacePage();
    } else if (domain.indexOf("www.") > -1) {
// 主站
        var href = location.href;
        href = href.toLowerCase();
        if (href.indexOf("/history") > -1) {
// 历史页、稍后观看页
            setMethod = setHistoryPage;
            checkItemClass = ".history-record";
            coverItemClass = ".preview";
            setHistoryPage();
        } else if (href.indexOf("/play/watchlater") > -1) {
// 稍后再看-视频观看页
            setMethod = setPlayWatchlaterPage;
            checkItemClass = ".pic";
            coverItemClass = ".van-framepreview";
            setPlayWatchlaterPage();
        } else if (href.indexOf("/watchlater") > -1) {
// 稍后再看页
            setMethod = setWatchlaterPage;
            checkItemClass = ".av-item";
            coverItemClass = ".av-pic";
            setWatchlaterPage();
        } else if (href.indexOf("/video") > -1) {
// 视频观看页
            setMethod = setVideoPage;
            checkItemClass = ".pic";
            coverItemClass = ".van-framepreview";
            isCheck = false;
            setTimeout(function () {
                setVideoPage();
            }, 5000)
        }
    }
// 检查执行结果
    timer = setInterval(checkBtnViewLoad, 1000);
});


// 设置视频观看页
var setVideoPage = function () {
    var refreshObj = $(".btnRefresh");
    if (refreshObj.size() == 0) {
// 右栏、接下来播放、自动连播的右边
        $(".rec-title").append("<a class='btnRefresh' title='如果列表没出现已看/未看标识，请手动点击这个按钮进行刷新'>刷新</a>");
// 视频下方、笔记按钮的右边
        $(".rigth-btn").append("<a class='btnRefresh' title='如果列表没出现已看/未看标识，请手动点击这个按钮进行刷新'>刷新↗</a>");
        $(".btnRefresh").click(function () {
// 从缓存中读取已看视频列表
            viewVideoJson = {};
            setVideoPage();
        })
        setTimeout(function () {
            $(".rec-list").bind("DOMNodeInserted", function (e) {
                var insertClass = $(e.target).attr("class");
                if (insertClass != "video-page-card") {
                    return;
                }
                if (refreshTimer != null) {
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }

                // 只执行最后一个
                refreshTimer = setTimeout(function () {
                    setVideoPage();
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }, 1000);
            })
        }, 5000);
    }

// 清空所有已看和未看
    $(".btnView").remove();
// 主视频
// 获取av
    av = location.href.replace("https://www.bilibili.com/video/", "");
    if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
        return;
    }
    var slashIndex = av.indexOf("/");
    var avId = "";
    if (slashIndex > -1) {
        av = av.substring(0, slashIndex);
    }
    slashIndex = av.indexOf("?");
    if (slashIndex > -1) {
        av = av.substring(0, slashIndex);
    }
    avId = av.replace("BV", "").replace("bv", "");
// 设置是否已看
    if (getBvIsViewed(avId)) {
// 已看
        $(".video-data").append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
    } else {
// 未看
        $(".video-data").append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
    }
// 订阅合集Item
    var initState = unsafeWindow.__INITIAL_STATE__;
    if (initState && initState.sectionsInfo && initState.sectionsInfo.sections && initState.sectionsInfo.sections.length > 0) {
        var epoArr = initState.sectionsInfo.sections[0].episodes;
        for (var i = 1; i < initState.sectionsInfo.sections.length; i++) {
            epoArr = epoArr.concat(initState.sectionsInfo.sections[i].episodes);
        }
        $(".video-episode-card").each(function (idx) {
            var preObj = $(this).children(".video-episode-card__info").children(".video-episode-card__info-title");
            var coverImg = $(this).children(".video-episode-card__cover").children(".lazy-img");
// 获取av
            try {
                av = epoArr[idx].bvid;
            } catch (e) {
                return;
            }
            if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
                return;
            }
            avId = av.replace("BV", "").replace("bv", "");
            if (getBvIsViewed(avId)) {
// 已看
                preObj.prepend("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
                coverImg.css("opacity", "0.1");
            } else {
// 未看
                preObj.prepend("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
                coverImg.css("opacity", "1");
            }
        })
    }
// 接下来播放、相关推荐Item
    $("#reco_list .pic").each(function () {
        var preObj = $(this).children("a");
// 获取av
        var href = preObj.attr("href");
        if (href == null || href == "") {
            return;
        }
        av = href.replace("/video/", "");
        if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
            return;
        }
        slashIndex = av.indexOf("/");
        if (slashIndex == -1) {
            return;
        }
        avId = av.substring(0, slashIndex).replace("BV", "").replace("bv", "");
        if (getBvIsViewed(avId)) {
// 已看
            $(this).append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
            preObj.children("img").css("opacity", "0.1");
        } else {
// 未看
            $(this).append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
            preObj.children("img").css("opacity", "1");
        }
    });
// 已看/未看按钮响应
    setBtnView();
}

// 设置历史页
var setHistoryPage = function () {
    var refreshObj = $(".btnRefresh");
    if (refreshObj.size() == 0) {
        $(".b-head-search").before("<a class='btnRefresh' title='如果列表没出现已看/未看标识，请手动点击这个按钮进行刷新'>刷新</a>");
        $(".btnRefresh").click(function () {
// 从缓存中读取已看视频列表
            viewVideoJson = {};
            setHistoryPage();
        })
        setTimeout(function () {
            $("#history_list").bind("DOMNodeInserted", function (e) {
                var insertClass = $(e.target).attr("class");
                if (insertClass != "history-record") {
                    return;
                }
                if (refreshTimer != null) {
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }
// 只执行最后一个
                refreshTimer = setTimeout(function () {
                    setHistoryPage();
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }, 1000);
            })
        }, 5000);
    }

// 清空所有已看和未看
    $(".btnView").remove();
// 普通Item
    $(".cover-contain").each(function () {
        var preObj = $(this).children(".preview");
// 获取av
        av = preObj.attr("href").replace("//www.bilibili.com/video/", "");
        if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
            return;
        }
        var slashIndex = av.indexOf("/");
        var avId = "";
        if (slashIndex > -1) {
            av = av.substring(0, slashIndex);
        }
        slashIndex = av.indexOf("?");
        if (slashIndex > -1) {
            av = av.substring(0, slashIndex);
        }
        avId = av.replace("BV", "").replace("bv", "");
        if (getBvIsViewed(avId)) {
// 已看
            $(this).append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
            preObj.css("opacity", "0.1");
        } else {
// 未看
            $(this).append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
            preObj.css("opacity", "1");
        }
    });
// 已看/未看按钮响应
    setBtnView();
}

// 稍后再看-视频观看页
var setPlayWatchlaterPage = function () {
    var refreshObj = $(".btnRefresh");
    if (refreshObj.size() == 0) {
        $(".tip-info").append("<a class='btnRefresh' title='如果列表没出现已看/未看标识，请手动点击这个按钮进行刷新'>刷新↗</a>");

        $(".btnRefresh").click(function () {
            // 从缓存中读取已看视频列表
            viewVideoJson = {};
            setPlayWatchlaterPage();
        })
        setTimeout(function () {

            $(".danmukuBox").bind("DOMNodeInserted", function (e) {
                var insertClass = $(e.target).attr("class");
                if (insertClass != "danmaku-wrap") {
                    return;
                }
                if (refreshTimer != null) {
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }
                // 只执行最后一个
                refreshTimer = setTimeout(function () {
                    setPlayWatchlaterPage();
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }, 5000);
            })


            $(".player-auxiliary-playlist-list").bind("DOMNodeInserted", function (e) {
                var insertClass = $(e.target).attr("class");
                if (insertClass != "player-auxiliary-playlist-item") {
                    return;
                }
                if (refreshTimer != null) {
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }
                // 只执行最后一个
                refreshTimer = setTimeout(function () {
                    setPlayWatchlaterPage();
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }, 1000);
            })

            $(".rcmd-list").bind("DOMNodeInserted", function (e) {
                var insertClass = $(e.target).attr("class");
                if (insertClass != "remd-video-card") {
                    return;
                }
                if (refreshTimer != null) {
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }

                // 只执行最后一个
                refreshTimer = setTimeout(function () {
                    setPlayWatchlaterPage();
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }, 1000);
            })

        }, 10000);
    }

// 清空所有已看和未看
    $(".btnView").remove();
// 主视频
// 获取av
    av = location.href.replace("https://www.bilibili.com/medialist/play/watchlater/", "");
    if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
        return;
    }
    var slashIndex = av.indexOf("/");
    var avId = "";
    if (slashIndex > -1) {
        av = av.substring(0, slashIndex);
    }
    slashIndex = av.indexOf("?");
    if (slashIndex > -1) {
        av = av.substring(0, slashIndex);
    }
    avId = av.replace("BV", "").replace("bv", "");
    if (getBvIsViewed(avId)) {
// 已看
        $(".video-data").append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
    } else {
// 未看
        $(".video-data").append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
    }
// 播放列表Item
    $(".player-auxiliary-playlist-list .player-auxiliary-playlist-item").each(function () {
        av = $(this).data("bvid");
        if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
            return;
        }
        avId = av.replace("BV", "").replace("bv", "");
        var preObj = $(this).children(".player-auxiliary-playlist-item-img");
        if (getBvIsViewed(avId)) {
// 已看
            $(this).append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
            preObj.css("opacity", "0.1");
        } else {
// 未看
            $(this).append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
            preObj.css("opacity", "1");
        }
    });

// 更多视频推荐Item
    $(".card-box .pic").each(function () {
        var preObj = $(this).children("a");
// 获取av
        var href = preObj.attr("href");
        if (href == null || href == "") {
            return;
        }
        av = href.replace("https://www.bilibili.com/video/", "");
        if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
            return;
        }
        slashIndex = av.indexOf("/");
        if (slashIndex == -1) {
            return;
        }
        avId = av.substring(0, slashIndex).replace("BV", "").replace("bv", "");
        if (getBvIsViewed(avId)) {
// 已看
            $(this).append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
            preObj.css("opacity", "0.1");
        } else {
// 未看
            $(this).append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
            preObj.css("opacity", "1");
        }
    });
// 已看/未看按钮响应
    setBtnView();
}

// 设置稍后观看页
var setWatchlaterPage = function () {
    var refreshObj = $(".btnRefresh");
    if (refreshObj.size() == 0) {
        $(".r-con").before("<a class='btnRefresh' title='如果列表没出现已看/未看标识，请手动点击这个按钮进行刷新'>刷新</a>");
        $(".btnRefresh").click(function () {
// 从缓存中读取已看视频列表
            viewVideoJson = {};
            setWatchlaterPage();
        })
        setTimeout(function () {
            $(".list-box").bind("DOMNodeInserted", function (e) {
                var insertClass = $(e.target).attr("class");
                if (insertClass != "av-item") {
                    return;
                }
                if (refreshTimer != null) {
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }
// 只执行最后一个
                refreshTimer = setTimeout(function () {
                    setWatchlaterPage();
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }, 1000);
            })
        }, 5000);
    }

// 清空所有已看和未看
    $(".btnView").remove();
// 普通Item
    $(".av-item").each(function () {
        var preObj = $(this).children(".av-pic");
// 获取av
        av = preObj.attr("href").replace("https://www.bilibili.com/medialist/play/watchlater/", "");
        if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
            return;
        }
        var slashIndex = av.indexOf("/");
        var avId = "";
        if (slashIndex > -1) {
            av = av.substring(0, slashIndex);
        }
        slashIndex = av.indexOf("?");
        if (slashIndex > -1) {
            av = av.substring(0, slashIndex);
        }
        avId = av.replace("BV", "").replace("bv", "");
        if (getBvIsViewed(avId)) {
// 已看
            $(this).append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
            preObj.css("opacity", "0.1");
        } else {
// 未看
            $(this).append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
            preObj.css("opacity", "1");
        }
    });
// 已看/未看按钮响应
    setBtnView();
}

// 设置空间页
var refreshTimer = null;
var setSpacePage = function () {
    var refreshObj = $(".btnSpaceRefresh");
    if (refreshObj.size() == 0) {
        $("#navigator .wrapper").prepend("<a class='btnSpaceRefresh' title='如果列表没出现已看/未看标识，请手动点击这个按钮进行刷新'>刷新</a>");
        $("#navigator-fixed .wrapper").prepend("<a class='btnSpaceRefresh' title='如果列表没出现已看/未看标识，请手动点击这个按钮进行刷新'>刷新</a>");
        $(".dyn-topic-panel").append("<a class='btnSpaceRefresh' title='如果列表没出现已看/未看标识，请手动点击这个按钮进行刷新'>←刷新</a>");
        $(".btnSpaceRefresh").click(function () {
// 从缓存中读取已看视频列表
            viewVideoJson = {};
            setSpacePage();
        })
        setTimeout(function () {
            $(".feed-card .content").bind("DOMNodeInserted", function (e) {
                if (refreshTimer != null) {
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }
// 只执行最后一个
                refreshTimer = setTimeout(function () {
                    setSpacePage();
                    clearTimeout(refreshTimer);
                    refreshTimer = null;
                }, 1000);
            })
        }, 5000);
    }

// 清空所有已看和未看
    $(".btnView").remove();
// 置顶视频
    $(".i-pin-part .content").each(function () {
// 获取av
        av = $(this).data("aid") + "";
        if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
            return;
        }
        var avId = av.replace("BV", "").replace("bv", "");
        if (getBvIsViewed(avId)) {
// 已看
            $(this).append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
            $(this).find(".cover").css("opacity", "0.1");
        } else {
// 未看
            $(this).append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
            $(this).find(".cover").css("opacity", "1");
        }
    });
// 普通Item
    $(".small-item").each(function () {
// 获取av
        av = $(this).data("aid") + "";
        if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
            return;
        }
        var avId = av.replace("BV", "").replace("bv", "");
        if (getBvIsViewed(avId)) {
// 已看
            $(this).append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
            $(this).find(".cover").css("opacity", "0.1");
        } else {
// 未看
            $(this).append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
            $(this).find(".cover").css("opacity", "1");
        }
    });
// 动态Item
    $(".video-container").each(function () {
// 获取av
        var a = $(this).children("a:eq(0)");
        av = $(a).attr("href").replace("//www.bilibili.com/video/", "");
        av = av.replace("https:", "");
        if (av == null || (!av.startsWith("BV") && !av.startsWith("bv"))) {
            return;
        }
        var slashIndex = av.indexOf("/");
        var avId = "";
        if (slashIndex > -1) {
            av = av.substring(0, slashIndex);
        }
        slashIndex = av.indexOf("?");
        if (slashIndex > -1) {
            av = av.substring(0, slashIndex);
        }
        avId = av.replace("BV", "").replace("bv", "");
        if (getBvIsViewed(avId)) {
// 已看
            $(this).append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
            $(this).find(".image-area").children("img:eq(0)").css("opacity", "0.1");
        } else {
// 未看
            $(this).append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
            $(this).find(".image-area").children("img:eq(0)").css("opacity", "1");
        }
    });
// 已看/未看按钮响应
    setBtnView();
// 分页按钮响应
    $(".be-pager li").unbind('click').click(function () {
        reloadPage();
    })
// 搜索视频按钮响应
    $(".search-btn").unbind('click').click(function () {
        reloadPage();
    })
// 回车监听响应
    $(document).unbind('keyup').keyup(function (event) {
        if (event.keyCode == 13) {
            reloadPage();
        }
    });
// 导航栏响应
    $(".n-tab-links a").unbind('click').click(function () {
        reloadPage();
    })
// 侧栏按钮响应
    $(".contribution-item").unbind('click').click(function () {
        reloadPage();
    })
// 排序按钮响应
    $(".be-tab-item").unbind('click').click(function () {
        reloadPage();
    })
// Tag点击响应
    $("#submit-video-type-filter a").unbind('click').click(function () {
        reloadPage();
    })
// 收藏列表响应
    $(".fav-item a").unbind('click').click(function () {
        reloadPage();
    })
}

// 设置已看/未看按钮响应
var coverItemClass = "";
var setBtnView = function () {
    $(".btnView").click(function (e) {
        var avId = $(this).data("av");
        var view = $(this).data("view");
// 先读再存（跨页操作）
        var coverObjs = $(this).parent().find(coverItemClass);
        var setIsViewed = false;
        if (view == 0) {
// 未看 -> 已看
            setIsViewed = true;
            $(this).text("已看");
            $(this).removeClass("btnNotView");
            $(this).addClass("btnIsView");
            $(this).data("view", "1");
            coverObjs.css("opacity", "0.1");
        } else {
// 已看 -> 未看
            $(this).text("未看");
            $(this).removeClass("btnIsView");
            $(this).addClass("btnNotView");
            $(this).data("view", "0");
            coverObjs.css("opacity", "0.1");
        }
// 即时存储
        saveGMVideoList(avId, setIsViewed);
// 重新读取
        setMethod();
    });
}

// 重新读取页面
var reloadPage = function () {
    checkCount = 0;
    setTimeout(function () {
// 执行一次
        setMethod();
// 检查执行结果
        timer = setInterval(checkBtnViewLoad, 2000);
    }, 1000);
}


// （多域名共用）检测按钮是否已加载，8次内有效
var isCheck = true;
var itemCount = 0;
var btnCount = 0;
var checkCount = 0;
var checkItemClass = "";

var checkBtnViewLoad = function () {
    if (!isCheck) {
        clearInterval(timer);
        timer = null;
        return;
    }
    itemCount = $(checkItemClass).size();
    btnCount = $(".btnView").size();
    if ((itemCount > 0 && itemCount == btnCount) || checkCount > 8) {
        clearInterval(timer);
        timer = null;
    } else {
        setMethod();
    }
    checkCount++;
}

// 设置搜索页面
var isView = 0;
var avStartStr = "//www.bilibili.com/video/BV";
var avStartIndex = -1;
var avEndIndex = -1;
var av = null;
var videoArr = null;
var isTextAreaHidden = true;
var setSearchPage = function () {
    var refreshObj = $(".btnRefresh");
    if (refreshObj.size() == 0) {
        $(".filter-wrap").append("<a class='btnList' title='显示/隐藏已看ID的数据列表，建议定期复制到其他地方进行保存，避免因事故造成丢失'>显示/隐藏</a>");
        $(".filter-wrap").append("<a class='btnRefresh' title='如果列表没出现已看/未看标识，请手动点击这个按钮进行刷新'>刷新</a>");
        $(".filter-wrap").append("<a class='btnListSave' title='如果文本框内容有修改，请点击这个按钮进行保存。'>保存列表</a>");
        $(".filter-wrap").append("<textarea class='viewList'></textarea>");

        $(".btnList").click(function () {
            if (isTextAreaHidden) {
                var keyList = GM_listValues();
                var key = "";
                var str = "";
                for (var i = 0; i < keyList.length; i++) {
                    key = keyList[i];
                    if (key.indexOf("BiliViewed_") == 0) {
                        str += GM_getValue(key, "") + ",";
                    }
                }
                $(".viewList").val(str);
            }
            isTextAreaHidden = !isTextAreaHidden;
            $(".viewList").toggle();
            $(".btnListSave").toggle();
        })

        $(".btnRefresh").click(function () {
            viewVideoJson = {};
            setSearchPage();
        })

        $(".btnListSave").click(function () {
            viewVideoList = $(".viewList").val();
            saveTextAreaVideoList(viewVideoList);
            isTextAreaHidden = !isTextAreaHidden;
            $(".viewList").toggle();
            $(".btnListSave").toggle();
        })
    }

// 清空所有已看和未看
    $(".btnView").remove();
    $(".video-item").each(function () {
// 获取av
        av = $(this).find("a:eq(0)").attr("href");
        avStartIndex = av.indexOf(avStartStr);
        avEndIndex = av.indexOf("?");
        var avId = av.substring(avStartIndex + avStartStr.length, avEndIndex);
        if (getBvIsViewed(avId)) {
// 已看
            $(this).append("<a class='btnView btnIsView' data-view='1' data-av='" + avId + "'>已看</a>");
            $(this).find(".lazy-img").css("opacity", "0.1");
        } else {
// 未看
            $(this).append("<a class='btnView btnNotView' data-view='0' data-av='" + avId + "'>未看</a>");
            $(this).find(".lazy-img").css("opacity", "1");
        }
    });
// 已看/未看按钮响应
    setBtnView();
// 分页按钮响应
    $(".page-item").unbind('click').click(function () {
        reloadPage();
    })
// 搜索按钮响应
    $(".search-button").unbind('click').click(function () {
        reloadPage();
    })
// 排序按钮响应
    $(".filter-item a").unbind('click').click(function () {
        reloadPage();
    })
// 分类菜单响应
    $(".v-switcher-header-item a").unbind('click').click(function () {
        reloadPage();
    })
// 回车监听响应
    $(document).unbind('keyup').keyup(function (event) {
        if (event.keyCode == 13) {
            reloadPage();
        }
    });
}

// 判断视频是否已看
var viewVideoJson = {};
var viewGroupArr = null;
var getBvIsViewed = function (bvid) {
    if (!bvid && bvid.length != 10) {
        return false;
    }
    var groupId = bvid.substr(1, 1);
    viewGroupArr = viewVideoJson[groupId];
    if (!viewGroupArr) {
        viewGroupArr = GM_getValue("BiliViewed_" + groupId, null);
        if (viewGroupArr == null) {
// 该分组未建立
            return false;
        }
        viewVideoJson[groupId] = viewGroupArr;
    }
    for (var i = 0; i < viewGroupArr.length; i++) {
        if (bvid == viewGroupArr[i]) {
            return true;
        }
    }
    return false;
}

// 更新和保存GM本地存储的列表
var saveGMVideoList = function (bvid, isViewed) {
    if (!bvid && bvid.length != 10) {
        return false;
    }
    var groupId = bvid.substr(1, 1);
    viewGroupArr = viewVideoJson[groupId];
    if (!viewGroupArr) {
        viewGroupArr = GM_getValue("BiliViewed_" + groupId, null);
        if (viewGroupArr == null) {
// 该分组未建立
            if (!isViewed) {
                return;
            }
            viewVideoJson[groupId] = [];
        }
    }
    if (isViewed) {
// 防止没刷新重复插入
        for (var i = 0; i < viewVideoJson[groupId].length && i < 10; i++) {
            if (viewVideoJson[groupId][i] == bvid) {
                return;
            }
        }
        viewVideoJson[groupId].unshift(bvid);
    } else {
        for (var i = 0; i < viewVideoJson[groupId].length; i++) {
            if (viewVideoJson[groupId][i] == bvid) {
                viewVideoJson[groupId].splice(i, 1);
            }
        }
    }
// 存储到GM
    GM_setValue("BiliViewed_" + groupId, viewVideoJson[groupId]);
}

// 对原已看视频数据列表进行分组（按第二个字母）
var groupGMVideoList = function (viewVideoList) {
    if (viewVideoList.length == 0) {
        GM_deleteValue("BiliViewed");
        return;
    }
    var videoArr = viewVideoList.split("\n");
    var gid = "";
    var groupJson = {};
    for (var i = 0; i < videoArr.length; i++) {
        if (videoArr[i].length != 10) {
            continue;
        }
        gid = videoArr[i].substr(1, 1);
        if (!groupJson[gid]) {
            groupJson[gid] = [];
        }
        groupJson[gid].unshift(videoArr[i]);
    }
// 存储各分表
    for (var key in groupJson) {
        GM_setValue("BiliViewed_" + key, groupJson[key]);
    }
// 删除原列表
    GM_deleteValue("BiliViewed");
}

// 对文本框的视频数据列表进行分组（按第二个字母）
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, 'gm'), s2);
};
var saveTextAreaVideoList = function (viewVideoList) {
    viewVideoList = viewVideoList.replaceAll("\n", ",");
    var videoArr = viewVideoList.split(",");
    var gid = "";
    var groupJson = {};
    for (var i = 0; i < videoArr.length; i++) {
        if (videoArr[i].length != 10) {
            continue;
        }
        gid = videoArr[i].substr(1, 1);
        if (!groupJson[gid]) {
            groupJson[gid] = [];
        }
        groupJson[gid].unshift(videoArr[i]);
    }
// 清空原来GM存储的所有数据
    var keyList = GM_listValues();
    var key = "";
    for (var i = 0; i < keyList.length; i++) {
        key = keyList[i];
        if (key.indexOf("BiliViewed_") == 0) {
            GM_deleteValue(key);
        }
    }
// 存储各分表
    for (var key in groupJson) {
        GM_setValue("BiliViewed_" + key, groupJson[key]);
    }
}

