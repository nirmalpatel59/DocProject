(function () {
    'use strict';

    var app = angular.module('app');

    app.controller('editDocCtrl', ['$log', '$scope', '$routeParams', '$sce', '$window', 'docService', '$timeout', 'localStorageService', 'config',
        function ($log, $scope, $routeParams, $sce, $window, docService, $timeout, localStorageService, config) {
            $log.debug('editDocCtrl called');

            var projectId = $routeParams.projectId;
            var docId = $routeParams.docId;

            var autoSaveDuration = config.editDoc.autoSaveDuration || (1000 * 60);
            var autoSaveExpiry = config.editDoc.autoSaveExpiry || (1000 * 60 * 60);    // 1 hour

            $scope.projectId = projectId;
            $scope.docId = docId;
            
            var timer;

            $scope.config = config;

            $scope.docContent;

            $scope.markdown = {};

            //console.debug($scope);

            var saveToCache = function () {
                var obj = {
                    timestamp: (new Date()).getTime(),
                    content: $scope.markdown.inputText
                };
                
                var key = projectId;
                
                if(docId)
                    key += '/' + docId;

                localStorageService.setItem(key, obj);

                $scope.cacheTime = new Date(obj.timestamp);
            };
            
            var removeCache = function () {
                var key = projectId;
                
                if(docId)
                    key += '/' + docId;

                $scope.cacheTime = undefined;
                localStorageService.removeItem(key);

                getDocContent();
            };

            var getDocFromCache = function () {
                var key = projectId;
                
                if(docId)
                    key += '/' + docId;

                var obj = localStorageService.getItem(key);

                if (!obj)
                    return '';

                if((new Date()).getTime() - obj.timestamp > autoSaveExpiry) {
                    removeCache();
                    return '';
                }

                if (obj.content) {
                    $scope.cacheTime = new Date(obj.timestamp);
                }
                
                $scope.markdown.inputText = obj.content;
                
                saveToCache();
            };

            var getDocContent = function () {
                docService.getDocContent(projectId, docId, function (data) {

                    if (Object.prototype.toString.call(data) === '[object Object]') {
                        data = data.data;
                    }

                    $scope.markdown.inputText = data;

                    //parseMarkdownContent();
                });
            };

            // auto save to local storage
            var runTimeout = function () {
                timer = $timeout(function () {
                    saveToCache();
                    runTimeout();
                }, autoSaveDuration);
            };

            getDocFromCache();

            if (!$scope.markdown.inputText) {
                getDocContent();
            }

            var trustAsHtml = function (string) {
                return $sce.trustAsHtml(string);
            };

            var parseMarkdownContent = function () {
                var mdContent = '';
                try {
                    mdContent = marked($scope.markdown.inputText);
                    mdContent = '<div class="alert alert-warning" role="alert">Do not press on any link other wise your content will lost</div>' + mdContent;
                } catch (e) {
                    mdContent = '<div class="alert alert-danger" role="alert">' + e + '</div>';
                    //console.error(e.message);
                    //throw e;
                }

                $scope.markdown.outputText = trustAsHtml(mdContent);
            };

            $scope.showPreview = function () {
                parseMarkdownContent();
                
                $log.debug('showing preview');

                if (config.editDoc.autoLocalSave) {
                    saveToCache();
                }
            };

            $scope.openSource = function () {
                var base64Data = btoa($scope.markdown.inputText);
                $window.open('data:text/plain;base64,' + base64Data);
            };
            
            $scope.save = function() {
                if(!$scope.config.enableDocSave)
                    return;
                
                docService.saveDocContent(projectId, docId, $scope.markdown.inputText);
            };

            $scope.removeCache = removeCache;
            
            // remove timer on route change
            $scope.$on('$destroy', function(e) {
                $timeout.cancel(timer);
            });

            docService.setCurrentProject(false);

            if (config.editDoc.autoLocalSave) {
                runTimeout();
            }
        }]);

})();
