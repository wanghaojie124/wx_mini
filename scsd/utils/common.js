// 小程序登陆
module.exports.requestServerLogin = function(url, method, data) {
    // 发起请求
    return new Promise(function(resolve, reject) {
        wx.request({
            url: getApp().data.host + url,
            data: data,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            method: method,
            dataType: 'json',
            success: function(res) {
                resolve(res)
            },
            fail: function(res) {
                reject(res)
            }
        })
    })
}

// 主请求
module.exports.requestServerData = function(url, method, data) {
    try {
        // data.code = '123456'
    } catch (e) {

    }
    // 发起请求
    return new Promise(function(resolve, reject) {
        wx.request({
            url: getApp().data.host + url,
            data: data,
            header: {
                'content-type': 'application/json'
            },
            method: method,
            success: function(res) {
                resolve(res)
            },
            fail: function(res) {
                reject(res)
            }
        })
    })
}

// 上传图片
module.exports.requestServerUpLoadImg = function(url, data) {
    // 发起请求
    return new Promise(function(resolve, reject) {
        wx.uploadFile({
            url: getApp().data.host + url,
            filePath: data, // 要上传文件资源的路径
            name: "image", // 文件对应的 key
            header: {
                // 'content-type': 'multipart/form-data'
                // 'content-type': 'application/json'
                'content-type': 'application/x-www-form-urlencoded'
            },
            // formData: formData, // HTTP 请求中其他额外的 form data
            success: function(res) {
                resolve(res)
            },
            fail: function(res) {
                reject(res)
            }
        })
    })
}