let AV = require('./app-leancloud.js');
let $ = require('jquery');
let eventHub = require('./eventHub.js');

let view = {
    el: '.collectionViewer',
    template: `
    <li>
        <div class="songName">__songName__</div>
        <div class="information">
            <span class="artist">__artist__</span>
            <span class="split"> - </span>
            <span class="album">__album__</span>
        </div>
    </li>`,

    render(data) {
        let target = $(this.el).find('.collectionList .songList');
        let itemString = this.template.replace('__songName__', data.songName)
                                    .replace('__artist__', data.artist)
                                    .replace('__album__', data.album);
        let item = $(itemString);
        item.prop('id', data.id);
        target.append(item);
    }
}

let model = {
    async queryListData(id) {
        let query = new AV.Query('CollectionList');
        return await query.get(id).then(async (list) => {
            return list;
        })
    },

    async querySongs(IDs) {
        let query = new AV.Query('SongList');
        query.containedIn('objectId', IDs);
        return await query.find().then(function(results) {
            return results;
        });
    }
}

let controller = {
    init(view, model) {
        this.view = view;
        this.model = model;
        this.bindEvent();
    },

    bindEvent() {
        this.watchShowCollectionList();
    },

    watchShowCollectionList() {
        eventHub.on('showCollectionList', async (data) => {
            let $el = $(this.view.el);
            let coverImg = $el.find('.collectionTheme > .cover > img');
            let collectionTitle = $el.find('.collectionTheme > .collectionTitle');
            let collectionList = $el.find('.collectionList .songList');

            let listData = await this.model.queryListData(data.id);
            coverImg.prop("src", listData.attributes.coverLink || 'http://pbeu96c1d.bkt.clouddn.com/14.jpg');
            collectionTitle.text(listData.attributes.collectionName);
            let IDs = [];
            for (let item of listData.attributes.songList) {
                IDs.push(item);
            }
            let songs = await this.model.querySongs(IDs);
            collectionList.find('li').remove();
            for (let item of songs) {
                let data = {
                    songName: item.attributes.name,
                    artist: item.attributes.artist,
                    album: item.attributes.album,
                    id: item.id
                }
                this.view.render(data);
            }
        })
    }


}

controller.init(view, model);
