
window.onload = function () {

    $("#btnLocation").click(function () {
        if ($('.store_Province').val() == "" || $('.store_City').val() == "" || $('.store_Area').val() == "") {
            layer.msg("请选择省市区", { time: 1500, icon: 5 });
            return;
        }
        if ($("#address").val() == "") {
            layer.msg("请填写详细地址", { time: 1500, icon: 5 });
            return;
        }
        var address = $('.store_Province').find("option:selected").text() + $('.store_City').find("option:selected").text() + $('.store_Area').find("option:selected").text() + $("#address").val();
        setPlace(address);
    });
    //市区选择控件
    $('.store_Area').change(function (obj) {
        if ($('.store_Province').val() == "" || $('.store_City').val() == "" || $('.store_Area').val() == "") {
            alert("请选择省市区");
            return;
        }
        $(".store_Lng").val("");
        $(".store_Lat").val("");
        earth();
    });

    //初始化方法
    function loadData() {

    }

    //#region 百度地图相关代码
    /*************************百度地图 **************************/
    function loadDefulatMap(callback) {
        var point = new BMap.Point(116.404, 39.915);  // 创建点坐标
        map.centerAndZoom(point, 15);                 // 初始化地图，设置中心点坐标和地图级别
        map.addControl(new BMap.NavigationControl());
        map.addControl(new BMap.ScaleControl());
        map.addControl(new BMap.OverviewMapControl());
        //map.addControl(new BMap.MapTypeControl()); //不同类型的百度地图
        map.setCurrentCity("北京"); // 仅当设置城市信息时，MapTypeControl的切换功能才能可用
        //地图加载完成后加载数据
        callback();
    }
    //市区下拉框选择事件
    function earth() {
        var address = $('.store_Province').find("option:selected").text() + $('.store_City').find("option:selected").text() + $('.store_Area').find("option:selected").text();;
        if (address != "") {
            var city = $(".store_City").val();
            // 创建地址解析器实例
            //  var myGeo = new BMap.Geocoder();
            myGeo.getPoint(address, function (point) {
                if (point) {
                    //定位到区 ，级别显示12
                    map.centerAndZoom(point, 12);
                    //删除选点
                    map.clearOverlays();
                } else {
                    // alert("您选择地址没有解析到结果!");
                }
            }, city);
        }
    }

    function Autocomplete() {
        //建立一个自动完成的对象
        var ac = new BMap.Autocomplete(
            {
                "input": "baiduAddress",
                "location": map
            });
        ac.addEventListener("onhighlight", function (e) {  //鼠标放在下拉列表上的事件
            var str = "";
            var _value = e.fromitem.value;
            var value = "";
            if (e.fromitem.index > -1) {
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str = "FromItem<br />index = " + e.fromitem.index + "<br />value = " + value;

            value = "";
            if (e.toitem.index > -1) {
                _value = e.toitem.value;
                value = _value.province + _value.city + _value.district + _value.street + _value.business;
            }
            str += "<br />ToItem<br />index = " + e.toitem.index + "<br />value = " + value;
            $(".area_tip").innerHTML = str;
        });
        ac.addEventListener("onconfirm", function (e) {//鼠标点击下拉列表后的事件
            var _value = e.item.value;
            var myValue = _value.street + _value.business;
            $(".area_tip").innerHTML = "onconfirm<br />index = " + e.item.index + "<br />myValue = " + myValue;
            setPlace(myValue);
        })
    }
    //地图选点点击事件
    function clickCoordinate(e) {
        var point = e.point;
        //请先选择省市区
        //var area = $(".store_Area").val();
        //if (area == null || area == "") {
        //    alert(baiduParam.SelectRegion_Error);
        //    return;
        //}
        createMarker(point);
    }
    function setPlace(value) {
        function myFun() {
            if (local.getResults().getPoi(0)) {
                var point = local.getResults().getPoi(0).point; //获取第一个智能搜索的结果
                createMarker(point);
            } else {
                alert("未搜索到结果，请重新输入");
            }
        }
        var local = new BMap.LocalSearch(map, { //智能搜索
            onSearchComplete: myFun
        });
        local.search(value);
    }

    var baiduParam = {
        oldPoint: null//记录旧值,用于地图拖拽失败后回到原来位置
        , Exceed_Error: "定位地址失败，您搜索或定位超出县级范围，请重新选择定位"
        , SelectRegion_Error: "定位地址失败，您搜索或定位超出县级范围，请先选择省市区"
        , Location_Div: "<div id='descConten'>已将坐标定位为<hr/>{address}<br/><small style='color: #858585;line-height: 24px;'>地址：{title}</small><br/><br/><input type='button' value='确定' id='saveLngLat' style=' background: rgb(135,205,208);border: none;color: white;height: 30px;width: 60px;border-radius: 4px;' ></div> "
        , Location_Sure_Div: "<img style='width:20px;top: 5px;position: relative;'  src='img/success.png' />已将坐标定位为<hr/>{address}<br/><small style='color: #858585;line-height: 24px;'>地址：{title}</small><br/><br/>"
    }

    function createMarker(point, isLoad) {
        //反向解析地址
        myGeo.getLocation(point, function (rs) {

            //验证区域是否在区域内
            //if (rs.addressComponents.province != $(".store_Province").find("option:selected").text() ||
            //    rs.addressComponents.city != $(".store_City").find("option:selected").text() ||
            //    rs.addressComponents.district != $(".store_Area").find("option:selected").text()) {
            //    alert(baiduParam.Exceed_Error);
            //    if (baiduParam.oldPoint) {
            //        createMarker(baiduParam.oldPoint);
            //    }
            //    return;
            //}
            map.clearOverlays();//清除之前所有的标志

            //红点开始
            var marker = new BMap.Marker(point);// 创建标注
            map.addOverlay(marker);             // 将标注添加到地图中
            marker.enableDragging();//可拖拽 自定义拖拽
            //拖拽前事件
            marker.addEventListener("dragstart", function (e) {
                baiduParam.oldPoint = e.point;
            })
            //拖拽完成事件
            marker.addEventListener("dragend", function (e) {
                createMarker(e.point);
            })
            //红点完成

            baiduParam.oldPoint = null;
            /******** 图层初始化 ********/
            /**图层样式文字处理开始**/
            var html = baiduParam.Location_Div;
            if (isLoad == true) {
                map.centerAndZoom(point, map.getZoom()); //重置地图位置
                html = baiduParam.Location_Sure_Div;
            }
            //解析地址
            var rsaddress = rs.address;
            var rstitle = rs.surroundingPois[0] != null ? rs.surroundingPois[0].title : "";
            html = html.replace("{address}", rsaddress).replace("{title}", rstitle);
            /**图层样式文字处理结束**/

            var infoWindow = new BMap.InfoWindow(html, { offset: { width: 0, height: -25 } });
            // 创建信息窗口对象
            map.openInfoWindow(infoWindow, point); //开启信息窗口
            //确定事件绑定
            infoWindow.addEventListener("open", function (a) {
                $("#saveLngLat").unbind("click");
                $("#saveLngLat").click(function () {
                    infoWindow.setContent("<img style='width:20px;top: -2px;position: relative;' src='img/success.png' />已将坐标定位为<hr/>" + rs.address + "<br/><small style='color: #858585;line-height: 24px;'>地址：" + (rs.surroundingPois[0] != null ? rs.surroundingPois[0].title : "") + "</small><br/><br/>");
                    $(".store_Lng").val(rs.point.lng);
                    $(".store_Lat").val(rs.point.lat);
                })
            })
            infoWindow.redraw(function () {
                $("#saveLngLat").unbind("click");
                $("#saveLngLat").click(function () {
                    infoWindow.setContent("<img style='width:20px;top: -2px;position: relative;'  src='img/success.png' />已将坐标定位为<hr/>" + rs.address + "<br/><small style='color: #858585;line-height: 24px;'>地址：" + (rs.surroundingPois[0] != null ? rs.surroundingPois[0].title : "") + "</small><br/><br/>");
                    $(".store_Lng").val(rs.point.lng);
                    $(".store_Lat").val(rs.point.lat);
                })
            });
            /******** 图层初始化 ********/
        });
    }
    //#region /****查询控件类****/
    function BigZoomControl() {
        // 设置默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_TOP_RIGHT;
        this.defaultOffset = new BMap.Size(150, 20);
    }
    // 通过JavaScript的prototype属性继承于BMap.Control
    BigZoomControl.prototype = new BMap.Control();
    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    BigZoomControl.prototype.initialize = function (map) {
        // 创建一个DOM元素
        var div = document.createElement("div");
        // 设置样式
        div.style.cursor = "pointer";
        div.style.margin = "0 auto";
        div.style.backgroundColor = "white";
        div.innerHTML = "<div><input type='text' id = 'baiduAddress' name = 'baiduAddress' style='width: 350px;height: 33px;text-indent:1em;float:left;border: 1px solid #D2D2D2!important;border-right:none;' placeholder='输入门店详细地址, 越详细定位越精准' /><div  class='searchMap' style='border:1px solid #f50;background-color:#f50;width:60px;height:33px;float:left;'></div><img  class='searchMap' src='img/search.png' style='height: 22px;position: absolute;right: 18px;top: 7px;'/><div style='clear:both'></div></div>";
        // 添加DOM元素到地图中
        map.getContainer().appendChild(div);
        // 将DOM元素返回
        return div;
    }
    //#endregion
    //#endregion

    //#region 百度地图初始化
    /****************百度地图初始化开始****************/
    var map = new BMap.Map("myMap");
    map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放
    // 创建地址解析器实例
    var myGeo = new BMap.Geocoder();
    loadDefulatMap(loadData);//初始化地图以及加载初始化数据
    // 创建控件
    var myZoomCtrl = new BigZoomControl();
    //// 查询控件类到地图当中
    map.addControl(myZoomCtrl);
    //查询控件的点击事件
    $(".searchMap").click(function () {
        setPlace($("#baiduAddress").val());
    });
    Autocomplete();//构建自动
    bindEvent();
    function bindEvent() {
        //查询百度地图
        map.addEventListener("click", clickCoordinate); //地图点击事件
    }
    /****************百度地图初始化完成****************/
    //#endregion
}

