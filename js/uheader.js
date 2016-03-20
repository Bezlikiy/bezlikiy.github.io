var MYAPP = {};
MYAPP.header = (function () {
  'use strict'; // включает использование современной версии JavaScript

  /*function switchClass(obj, className) {
    // добавляет/удаляет класс className в зависимости от отсутствия/присутствия этого класса в объекте
    var classList = obj.classList;
    classList.toggle(className);
  }
  */

  function defineMenuBtn(btnID, menuID, switchClassName) {
    var btn = document.getElementById(btnID);
    btn.onclick = function() {
      var menu = document.getElementById(menuID);
      menu.classList.toggle(switchClassName);
    };
  }

  function defineMenuBtnEx(button, menu) {
    // добаавляет класс в меню и кнопку при нажатии
    // button, menu = {id: 'button id', class: 'switch class name'}
    var btnObj = document.getElementById(button.id);
    btnObj.onclick = function() {
      var menuObj = document.getElementById(menu.id);
      btnObj.classList.toggle(button.class);
      menuObj.classList.toggle(menu.class);
    };
  }
  
  function ResizeClass(domElement, className, milliseconds) {
    // добавляет класс className в элемент domElement при изменении размера окна
    var classList = domElement.classList;
    var resized;
    var timer;
    
    function onTime(){
      if (resized) {
        resized = false;
      } else {
        classList.remove(className);
        clearInterval(timer);
        timer = null;
      }
    }
    this.resize = function() {
      resized = true;
      classList.add(className);
      if (!timer) {
        timer = setInterval(onTime, milliseconds);
      }
    };
  }
  
  /***********************************************
   *
   * Классы прототипов
   * инфа: 
   * наследование через прототипы - https://learn.javascript.ru/class-inheritance
   * Маньячная минимизация (в погоне за байтом) - https://habrahabr.ru/post/127672/
   **/


  /*** Класс-MoveElemBase *********************************************/
  function MoveElemBase() {
  /* концепция "MoveElemBase" - реализует базовую функциональность перемещения элементов
    отмена произведённых перемещений:
    - _addToMoveList добавляет элемент в список перемещённых
    - restore отменяет произведённые перемещения */
    this._moveList = [];
  }

  MoveElemBase.prototype._addToMoveList = function(element) {
    this._moveList.push(
      { node: element, parent: element.parentNode, next: element.nextSibling }
    );
  };

  MoveElemBase.prototype.restore = function() {
    // Метод "restore" отменяет произведённые перемещения
    // вернуть перемещённые элементы в dom-узлы до перемещения
    var list = this._moveList;
    for (var i = 0; i < list.length; i++) {
      var listItem = list[i];
      listItem.parent.appendChild(listItem.node);
    }
    
    // dосстановить позиции возвращённых блоков
    while (list.length > 0) {
      var listItem = list.pop();
      listItem.parent.insertBefore(listItem.node, listItem.next);
    }
  };

  /*** Класс-MoveElements *********************************************/
  function MoveElements() {
    /* MoveElemBase.apply(this, arguments); - если-бы требовалось передать все аргументы
       MoveElemBase.call(this, arg1, arg2, ...); - конкретный набор аргументов */
    MoveElemBase.call(this);
  }
  MoveElements.prototype = Object.create(MoveElemBase.prototype); // унаследовать
  MoveElements.prototype.constructor = MoveElements; // сохранить конструктор потомка

  MoveElements.prototype.move = function(elemListID, insertRootID, insertBeforeID) {
    /* Метод "move" перемещает группу элементов в указанный контейнер insertRootID
    порядок добавления элементов в контейнер совпадает с elemListID */
    var insertRoot = document.getElementById(insertRootID);
    if (insertRoot) {
      var insertBefore = null;
      if (insertBeforeID)
        insertBefore = document.getElementById(insertBeforeID);
      for (var i = 0; i < elemListID.length; i++) {
        var elem = document.getElementById(elemListID[i]);
        if (elem.parentNode !== insertRoot) {
          MoveElemBase.prototype._addToMoveList.call(this, elem); // Вызов метода родителя внутри своего
          insertRoot.insertBefore(elem, insertBefore);
        }
      }
    };  
    /*
    найти "корневой узел"
    если "корневой узел" найден, то:
      установить "следующий узел" в "нет узла"
      если "следующий узел" определён, то:
        найти "следующий узел"
      
      цикл: от начала до конца списка элементов
        найти "элемент" по его идентификатору
        если "корень элемента" не совпадает с "корневой узел", то:
          добавить "элемент" в "список перемещённых":
            запомнить позицию элемента
            добавть элемент в список
          переместить "элемент" в "корень элемента" перед "следующий узел"
        конец "если"        
      конец "цикла"
    конец "если"
    */
  };

  /*** Класс-InsertContainers *********************************************/
  function InsertContainers(blockListID, blockRootID) {
  /* Изменяет dom-структуру, перемещая элементы в создаваемые контейнеры
    Инициализируется передачей идентификатора корневого узла blockRootID для контейнеров и
    массивом объектных литералов, описывающих создание контейнеров:
      var blockListID = [ // 
        { element: "div", id: "uniqueID-1", className: "class1 class2" },
        { element: "div", id: "uniqueID-1", className: "class1 class2" }
      ];
    - move перемещает элементы в ранее созданный контейнер. Выбор перемещаемых 
      элементов и контейнера производится по свойству id=""
      Пример использования: move("uniqueID-1", ["elementID-1", "elementID-2", ... , elementID-N]);
    */
    function createBlock(blockInfo) {
      var newBlock = document.createElement(blockInfo.element);
      newBlock.id = blockInfo.id;
      newBlock.className = blockInfo.className;
      newBlock.teg = blockInfo;
      return newBlock;
    }
    
    MoveElemBase.call(this); // вызвать родительский конструктор
    this._blockParent = document.getElementById(blockRootID);
    this._blockList = []; 
    
    // инициализировать список контейнеров
    for (var i = 0; i < blockListID.length; i++) {
      this._blockList.push( createBlock(blockListID[i]) );
    }
  }
  InsertContainers.prototype = Object.create(MoveElemBase.prototype); // унаследовать
  InsertContainers.prototype.constructor = InsertContainers; // сохранить constructor

  InsertContainers.prototype.move = function(blockID, elemListID) {
    /* Метод "move" перемещает группу элементов в указанный контейнер blockID
    порядок расположения элементов в контейнере совпадает с elemListID */
    function getBlockByID(blockID, list) {
      for (var i = 0; i < list.length; i++)
        if ( list[i].id ===  blockID )
          return list[i];
    }
    
    var block = getBlockByID(blockID, this._blockList);
    if (block && !block.parentNode) {
      for (var i = 0; i < elemListID.length; i++) {
        var elem = document.getElementById(elemListID[i]);
        MoveElemBase.prototype._addToMoveList.call(this, elem); // вызов метода родителя
        block.appendChild(elem);
      }
      this._blockParent.appendChild(block);
    }
    /*
    найти блок по переданному идентификатору (метод)
    если блок существует и у блока нет родителя, то:
      цикл: от первого до последнего элемента списка
        если у элемента нет тега, то:
          назначить тег:
            запомнить родительский элемент
            запомнить следующий элемент
        конец "если"
        переместить элемент в блок
        добавить элемент в список перемещённых
      конец "цикла"
      переместить блок в "главный блок"
    конец "если"
    */
  };

  InsertContainers.prototype.restore = function() {
    // Метод "restore" отменяет произведённые перемещения
    
    // удалить из главного блока "блоки-контейнеры"
    var list = this._blockList;
    for (var i = 0; i < list.length; i++) {
      var blockParent = list[i].parentNode;
      if (blockParent)
        blockParent.removeChild(list[i]);       
    }
    
    // вызвать метод родителя, передав ему все аргументы метода
    MoveElemBase.prototype.restore.apply(this, arguments);
  };
  
  /*** Класс- *********************************************/

  // контроллер слежения за изменением ширины окна
  function WidthChangeController(cb, param) {
    function doResize() {
      cb(param);
    }
    this.change = doResize;
    window.addEventListener("resize", doResize); // подключить к событиям окна
  }
  
  function SiteHeader() {
  /* Формирует структуру заголовка сайта */
    // strict private const
    //var HEADER_STRUCT_WIDTH = 1280;
    var HEADER_STRUCT_WIDTH = 1240;
     
    // strict private fields
    var _windowResize;
    var _headerContainers;
    var _headerSearchMove;
    var _resizeController;
    
    // strict private methods
    function DoResize(state) {
      _windowResize.resize();
      if (window.innerWidth >= HEADER_STRUCT_WIDTH) {
        if (state.current !== state.larger) {
          state.current = state.larger;
          _headerContainers.move("h-part-1", ["site-name", "menu-second", "btn-menu-main", "banner-a"]);
          _headerContainers.move("h-part-2", ["menu-social", "site-logo"]);
          _headerSearchMove.move(['form-search', 'btn-search'], 'menu-second');
        }
      } else {
        if (state.current !== state.less) {
          state.current = state.less;
          _headerSearchMove.restore();
          _headerContainers.restore();
        }
      }
    }
    
    // public methods
    this.init = function(){
      if (!_windowResize) {
        _windowResize = new ResizeClass(document.body, "resized", 100);
        _headerSearchMove = new MoveElements();
        
        // массив объектных литералов для создания контейнеров
        var blockListID = [
          { element: "div", id: "h-part-1", className: "h-part-1 someClass" },
          { element: "div", id: "h-part-2", className: "h-part-2 someClass" }
        ];
        _headerContainers = new InsertContainers(blockListID, "site-header");
        _resizeController = new WidthChangeController(DoResize, 
          { current: 0, larger: 1, less: 2 }
        );
        _resizeController.change(); // проверить расположение блоков
        
        // инициализировать кнопки меню
        defineMenuBtnEx( // главное меню
          {id: "btn-menu-main", class: "close"},
          {id: "content-wrapper", class: "show"} );
        defineMenuBtnEx( // вторичное меню
          {id: "btn-menu-second", class: "close"},
          {id: "menu-second", class: "show"} );
        defineMenuBtnEx( // поисковое меню
          {id: "btn-search", class: "close"},
          {id: "form-search", class: "show"} );
      }
    };
  }
  
  var siteHeader = new SiteHeader();
  return { // export methods
    init: siteHeader.init
    
    // для тестирования классов
    , constructor_MoveElements: MoveElements,
    defineMenuBtn: defineMenuBtn,
    defineMenuBtnEx: defineMenuBtnEx
  }
})();

// выполнить скрипт после загрузки DOM-элементов
document.addEventListener("DOMContentLoaded",
  function() {
    MYAPP.header.init();
  }
);