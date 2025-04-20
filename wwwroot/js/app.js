$(document).ready(function () {
    const apiUrl = '/api/Points';
    let selectedPointData = null;
    let selectedCommentData = null; 
    let allPointsData = [];

    const stage = new Konva.Stage({
        container: 'stage-container',
        width: $('#stage-container').width(),
        height: $('#stage-container').height(),
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    function hideAllForms() {
        $('#add-comment-section').hide();
        $('#edit-point-section').hide();
        $('#edit-comment-section').hide();
        selectedPointData = null;
        selectedCommentData = null;
    }

    function drawPointAndComments(pointData) {
        const group = new Konva.Group({
            draggable: false, 
            id: 'pointGroup_' + pointData.id
        });
        group.pointId = pointData.id;

        const circle = new Konva.Circle({
            x: pointData.x,
            y: pointData.y,
            radius: pointData.radius,
            fill: pointData.color,
            stroke: 'black',
            strokeWidth: 1,
        });
        circle.pointData = pointData;
        group.add(circle);


        let currentCommentY = pointData.y + pointData.radius + 5;
        const commentWidth = 150;
        const commentPadding = 5;

        if (pointData.comments && pointData.comments.length > 0) {
            pointData.comments.forEach(commentData => {
                const commentGroup = new Konva.Group({
                    x: pointData.x - commentWidth / 2,
                    y: currentCommentY
                });
                commentGroup.commentData = commentData; 
                commentGroup.pointId = pointData.id;    

                const commentText = new Konva.Text({
                    x: 0,
                    y: commentPadding,
                    text: commentData.text,
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fill: '#000',
                    width: commentWidth - 2 * commentPadding,
                    padding: commentPadding,
                    align: 'center'
                });

                const textHeight = commentText.height();

                const commentRect = new Konva.Rect({
                    x: 0,
                    y: 0,
                    width: commentWidth,
                    height: textHeight,
                    fill: commentData.backgroundColor,
                    stroke: '#555',
                    strokeWidth: 1,
                    cornerRadius: 3,
                });

                commentGroup.add(commentRect);
                commentGroup.add(commentText);
                group.add(commentGroup); 

                currentCommentY += textHeight + 2;
                
                commentGroup.on('click tap', function(e) {
                    e.cancelBubble = true; 
                    hideAllForms();
                    selectedCommentData = this.commentData;
                    selectedPointData = allPointsData.find(p => p.id === this.pointId); 

                    console.log("Selected comment:", selectedCommentData);
                    console.log("Parent point:", selectedPointData);

                    if (!selectedCommentData || !selectedPointData) {
                        console.error("Could not find comment or parent point data.");
                        return;
                    }
                    
                    $('#edit-comment-id').val(selectedCommentData.id);
                    $('#edit-comment-point-id').val(selectedPointData.id); 
                    $('#edit-comment-text').val(selectedCommentData.text);
                    $('#edit-comment-bg-color').val(selectedCommentData.backgroundColor);
                    $('#edit-comment-id-display').text(`(ID: ${selectedCommentData.id} для точки ${selectedPointData.id})`);

                    $('#edit-comment-section').show(); 
                });

            });
        }
        circle.on('click tap', function(e) {
            e.cancelBubble = true; 
            hideAllForms(); 
            selectedPointData = this.pointData; 

            console.log("Selected point:", selectedPointData);

            if (!selectedPointData) {
                console.error("Could not find point data on circle.");
                return;
            }
            
            $('#comment-point-id').val(selectedPointData.id);
            $('#selected-point-id').text(`(ID: ${selectedPointData.id})`);
            $('#add-comment-section').show();
            
            $('#edit-point-id').val(selectedPointData.id);
            $('#edit-point-id-display').text(`(ID: ${selectedPointData.id})`);
            $('#edit-point-x').val(selectedPointData.x);
            $('#edit-point-y').val(selectedPointData.y);
            $('#edit-point-radius').val(selectedPointData.radius);
            $('#edit-point-color').val(selectedPointData.color);
            $('#edit-point-section').show();
        });


        circle.on('dblclick dbltap', function () {
            if (confirm(`Удалить точку с ID ${this.pointData.id}?`)) {
                deletePoint(this.pointData.id);
            }
        });

        layer.add(group);
    }

    function redrawAllPoints(points) {
        layer.destroyChildren(); 
        allPointsData = points || [];
        if (allPointsData.length > 0) {
            allPointsData.forEach(point => drawPointAndComments(point));
        }
        layer.batchDraw(); 
    }

    function loadPoints() {
        $.ajax({
            url: apiUrl,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                redrawAllPoints(data);
            },
            error: function (xhr, status, error) {
                console.error("Ошибка загрузки точек:", status, error);
                alert("Не удалось загрузить точки. См. консоль для деталей.");
            }
        });
    }

    function addPoint(pointData) {
        $.ajax({
            url: apiUrl,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(pointData),
            success: function (newPoint) {
                loadPoints();
                $('#add-point-form')[0].reset();
                alert(`Точка с ID ${newPoint.id} успешно добавлена.`);
            },
            error: function (xhr, status, error) {
                console.error("Ошибка добавления точки:", status, error, xhr.responseText);
                alert("Не удалось добавить точку. См. консоль для деталей.");
            }
        });
    }

    function deletePoint(pointId) {
        $.ajax({
            url: `${apiUrl}/${pointId}`,
            method: 'DELETE',
            success: function () {
                hideAllForms(); 
                loadPoints();
                alert(`Точка с ID ${pointId} удалена.`);
            },
            error: function (xhr, status, error) {
                console.error("Ошибка удаления точки:", status, error, xhr.responseText);
                alert("Не удалось удалить точку. См. консоль для деталей.");
            }
        });
    }

    function addComment(pointId, commentData) {
        $.ajax({
            url: `${apiUrl}/${pointId}/comments`, 
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(commentData),
            success: function (newComment) {
                alert('Комментарий добавлен!');
                loadPoints(); 
                $('#add-comment-form')[0].reset();
                $('#add-comment-section').hide();
                selectedPointData = null;
            },
            error: function (xhr, status, error) {
                console.error("Произошла ошибка при добавлении комментария.");
                console.error("Requested URL:", `${apiUrl}/${pointId}/comments`);
                console.error("Status Code:", xhr.status);
                console.error("Server Response Text:", xhr.responseText);
                alert("Не удалось добавить комментарий. Код статуса: " + xhr.status + ". См. консоль для деталей.");
            }
        });
    }

    function updatePoint(pointId, pointData) {
        $.ajax({
            url: `${apiUrl}/${pointId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(pointData),
            success: function () {
                alert(`Точка с ID ${pointId} успешно обновлена.`);
                hideAllForms(); 
                loadPoints();   
            },
            error: function (xhr, status, error) {
                console.error("Ошибка обновления точки:", status, error, xhr.responseText);
                alert("Не удалось обновить точку. Код статуса: " + xhr.status + ". См. консоль для деталей.");
            }
        });
    }
    
    function updateComment(pointId, commentId, commentData) {
        $.ajax({
            url: `${apiUrl}/${pointId}/comments/${commentId}`, 
            method: 'PUT', 
            contentType: 'application/json',
            data: JSON.stringify(commentData),
            success: function () {
                alert(`Комментарий с ID ${commentId} успешно обновлен.`);
                hideAllForms(); 
                loadPoints();   
            },
            error: function (xhr, status, error) {
                console.error("Ошибка обновления комментария:", status, error, xhr.responseText);
                alert("Не удалось обновить комментарий. Код статуса: " + xhr.status + ". См. консоль для деталей.");
            }
        });
    }

    $('#add-point-form').on('submit', function (event) {
        console.log("Add Point form submitted!"); 
        event.preventDefault();
        const newPoint = {
            x: parseFloat($('#point-x').val()),
            y: parseFloat($('#point-y').val()),
            radius: parseFloat($('#point-radius').val()),
            color: $('#point-color').val(),
            comments: []
        };
        console.log("Attempting to add point:", newPoint); 
        addPoint(newPoint);
    });
    
    $('#add-comment-form').on('submit', function (event) {
        event.preventDefault();
        const pointId = parseInt($('#comment-point-id').val());
        if (!pointId || isNaN(pointId) || pointId <= 0) {
            alert("Ошибка: Не выбран ID точки для добавления комментария.");
            return;
        }
        const newComment = {
            Text: $('#comment-text').val(),
            BackgroundColor: $('#comment-bg-color').val(),
        };
        addComment(pointId, newComment);
    });
    
    $('#edit-point-form').on('submit', function (event) {
        event.preventDefault();
        const pointId = parseInt($('#edit-point-id').val());
        if (!pointId || isNaN(pointId) || pointId <= 0) {
            alert("Ошибка: Не удалось определить ID редактируемой точки.");
            return;
        }
        const updatedPointData = {
            id: pointId, 
            x: parseFloat($('#edit-point-x').val()),
            y: parseFloat($('#edit-point-y').val()),
            radius: parseFloat($('#edit-point-radius').val()),
            color: $('#edit-point-color').val(),
        };
        updatePoint(pointId, updatedPointData);
    });
    
    $('#edit-comment-form').on('submit', function (event) {
        event.preventDefault();
        const commentId = parseInt($('#edit-comment-id').val());
        const pointId = parseInt($('#edit-comment-point-id').val()); 

        if (!commentId || isNaN(commentId) || commentId <= 0 || !pointId || isNaN(pointId) || pointId <= 0) {
            alert("Ошибка: Не удалось определить ID редактируемого комментария или его точки.");
            return;
        }

        const updatedCommentData = {
            id: commentId, 
            pointId: pointId, 
            text: $('#edit-comment-text').val(),
            backgroundColor: $('#edit-comment-bg-color').val(),
        };
        updateComment(pointId, commentId, updatedCommentData);
    });

    
    $('#cancel-add-comment').on('click', function() {
        $('#add-comment-section').hide();
        selectedPointData = null; 
    });

    $('#cancel-edit-point').on('click', function() {
        $('#edit-point-section').hide();
        selectedPointData = null; 
    });

    $('#cancel-edit-comment').on('click', function() {
        $('#edit-comment-section').hide();
        selectedCommentData = null;
    });
    
    stage.on('click tap', function(e) {
        if (e.target === stage) {
            hideAllForms();
        }
    });
    
    loadPoints();
});
