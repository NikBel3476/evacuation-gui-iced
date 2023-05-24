import win32com.client
import json
import os

def main():
    app = win32com.client.Dispatch("Renga.Application.1")

    app.Visible = True

    file_name = "school11v3_latest"
    file_extension = ".rnp"
    current_dir = os.path.dirname(os.path.realpath(__file__))
    renga_file_path = os.path.join(current_dir, '..', 'res', 'renga', file_name + file_extension)
    app.OpenProject(renga_file_path)
    project = app.Project
    model = project.Model
    objectCollection = model.GetObjects()
    levelType = '{c3ce17ff-6f28-411f-b18d-74fe957b2ba8}'.upper()  # GUID for the 'level' object type, as listed in documentation. See "Object types".
    roomType = '{f1a805ff-573d-f46b-ffba-57f4bccaa6ed}'.upper()
    wallType = '{4329112a-6b65-48d9-9da8-abf1f8f36327}'.upper()
    floorType = "{f5bd8bd8-39c1-47f8-8499-f673c580dfbe}".upper()
    doorType = "{1cfba99c-01e7-4078-ae1a-3e2ff0673599}".upper()
    DoorThreshold = "{386ee889-38aa-4016-9e62-6b893f99ce43}".upper()
    stairType = '{3f522f49-aee2-4d73-9866-9b07cf336a69}'.upper()
    # r = win32com.client.Record("GridTypes", 0)
    # print(project.DataExporter.GetObjects3D().Get(2).GetMesh(0).GetGrid(0).GetVertex(0))
    Objects3DCollection = project.DataExporter.GetObjects3D()  # Экспортируем все объекты

    objectId = 0

    roomsData = []
    doorsData = []
    stairsData = []
    levelData = []

    def level():
        for idx in range(objectCollection.Count):
            object = objectCollection.GetByIndex(idx)
            if object.ObjectTypeS == levelType:
                parameterContainer = object.GetParameters()
                LevelElevation = '{440a20f8-42b8-4a5f-9000-39ef58e0302b}'.upper()
                # for i in range(parameterContainer.GetIds().Count):
                LevelName = '{1bb1addf-a3c0-4356-9525-107ea7df1513}'.upper()
                levelData.append({'levelZ': parameterContainer.GetS(LevelElevation).GetDoubleValue(),
                                  'levelName': parameterContainer.GetS(LevelName).GetStringValue()})
                print(parameterContainer.GetS(LevelElevation).GetDoubleValue())
                print(parameterContainer.GetS(LevelName).GetStringValue())
                # levelModel = object.GetInterfaceByName("ILevel")

    def getCoordStairs():
        netFloorArea = "{ea60d526-b527-4896-8e4c-c84a8462b3cc}".upper()  # Площадь
        StairHeight = "{6eb5fbe0-3b56-484b-8dde-06de32187a66}".upper()  # Высота лестницы
        LevelElevation = '{440a20f8-42b8-4a5f-9000-39ef58e0302b}'.upper()
        LevelId = '{8cdf2e5b-03f7-4101-9b43-93b9da18f411}'.upper()
        for i in range(Objects3DCollection.Count):
            Object3D = Objects3DCollection.Get(i)
            if Object3D.ModelObjectTypeS == stairType:
                stair = {}
                points = []
                objectId = Object3D.ModelObjectId
                stair['Sign'] = 'Staircase'
                stair['Output'] = []
                id_string = str(objectCollection.GetById(objectId).UniqueIdS)
                stair['Id'] = id_string[1: len(id_string) - 1]
                stair['@'] = id_string[1: len(id_string) - 1]
                stair['Name'] = objectCollection.GetById(objectId).Name

                quantitiesContainer = objectCollection.GetById(objectId).GetQuantities()
                parameterContainer = objectCollection.GetById(objectId).GetParameters()

                stair['Area'] = quantitiesContainer.GetS(netFloorArea).AsArea(3)
                stair['SizeZ'] = parameterContainer.GetS(StairHeight).GetDoubleValue() / 1000
                level = objectCollection.GetById(parameterContainer.GetS(LevelId).GetIntValue())
                # room['roomLevelName'] = level.GetParameters().GetS(LevelName).GetStringValue()
                stair['ZLevel'] = level.GetParameters().GetS(LevelElevation).GetDoubleValue()
                pointsZ = []
                for j in range(Object3D.GetMesh(0).GridCount):  # У комнаты 1 меш
                    gridStair = Object3D.GetMesh(0).GetGrid(j)  # разбиваем комнаты на грид

                    if gridStair.GridType == 1:  # идентификатор верхней плоскости лестницы
                        # for triangleIdx in range(gridRoom.TriangleCount):
                        #    triangleVertex.append([gridRoom.GetVertex(gridRoom.GetTriangle(triangleIdx).V0), gridRoom.GetVertex(gridRoom.GetTriangle(triangleIdx).V1), gridRoom.GetVertex(gridRoom.GetTriangle(triangleIdx).V2)])

                        # print(triangle)

                        for k in range(gridStair.VertexCount):  # Перебираем вершины
                            points.append({'x': gridStair.GetVertex(k).X / 1000, 'y': gridStair.GetVertex(k).Y / 1000,
                                           'z': gridStair.GetVertex(k).Z / 1000})
                            pointsZ.append(gridStair.GetVertex(k).Z / 1000)
                            # print(f' Комната {gridRoom.GetVertex(k)}')
                            # xPoints.append(gridRoom.GetVertex(k).X)
                            # yPoints.append(gridRoom.GetVertex(k).Y)
                        points.append(points[0])

                print(len(pointsZ))
                minPointZ = min(pointsZ)
                maxPointZ = max(pointsZ)
                polygonPointsStair = []
                # print(minPointZ)
                for point in points:  # Выбираем самые низкие и высокие точки летницы
                    if ((point['z'] == minPointZ or point['z'] == maxPointZ) and point not in polygonPointsStair):
                        polygonPointsStair.append(point)
                # print(len(polygonPointsStair))
                stair['XY'] = [{'points': polygonPointsStair}]
                stairsData.append(stair)
                # pprint(stairsData)

    getCoordStairs()

    def getCoordRoom():
        xPoints = []
        yPoints = []
        RoomHeight = '{187c61e7-26dd-40e3-aeb6-3274aec082d2}'.upper()
        netFloorArea = "{ea60d526-b527-4896-8e4c-c84a8462b3cc}".upper()  # Площадь
        RelativeObjectTopElevation = "{3ca98238-a2b5-424a-a579-6a0d66ef075a}".upper()  # Высота относительно 0, вкрхняя грань
        LevelId = '{8cdf2e5b-03f7-4101-9b43-93b9da18f411}'.upper()
        LevelElevation = '{440a20f8-42b8-4a5f-9000-39ef58e0302b}'.upper()
        # for i in range(parameterContainer.GetIds().Count):
        LevelName = '{1bb1addf-a3c0-4356-9525-107ea7df1513}'.upper()

        for i in range(Objects3DCollection.Count):

            # print(f'сколько всего обжект 3Д коллекшн{Objects3DCollection.Count}')
            # print(project.DataExporter.GetObjects3D().Get(6).ModelObjectTypeS)
            Object3D = Objects3DCollection.Get(i)
            if Object3D.ModelObjectTypeS == roomType:  # Ищем меши комнаты
                triangleVertex = []
                # print(f'ModelObjectId {Object3D.ModelObjectId}')
                room = {}
                points = []
                # print(Object3D.ModelObjectId)
                objectId = Object3D.ModelObjectId
                # print(objectCollection.GetById(objectId).UniqueIdS)
                UniqueId = objectCollection.GetById(objectId).UniqueId
                # print(UniqueId)
                roomObject = objectCollection.GetById(objectId)
                room['Sign'] = 'Room'
                room['Output'] = []
                id_string = str(objectCollection.GetById(objectId).UniqueIdS)
                room['Id'] = id_string[1: len(id_string) - 1]
                room['@'] = id_string[1: len(id_string) - 1]
                room['Name'] = objectCollection.GetById(objectId).Name

                quantitiesContainer = objectCollection.GetById(objectId).GetQuantities()
                propertyContainer = objectCollection.GetById(objectId).GetProperties()
                parameterContainer = objectCollection.GetById(objectId).GetParameters()

                room['Area'] = quantitiesContainer.GetS(netFloorArea).AsArea(3)
                # print(parameterContainer.GetS(RoomHeight).GetDoubleValue())
                # room['SizeZ'] = quantitiesContainer.GetS(RelativeObjectTopElevation).AsLength(4)
                room['SizeZ'] = parameterContainer.GetS(RoomHeight).GetDoubleValue() / 1000

                level = objectCollection.GetById(parameterContainer.GetS(LevelId).GetIntValue())
                levelUuid = level.UniqueIds
                levelArr = []

                # room['roomLevelName'] = level.GetParameters().GetS(LevelName).GetStringValue()
                room['ZLevel'] = level.GetParameters().GetS(LevelElevation).GetDoubleValue()
                roomLevelName = level.GetParameters().GetS(LevelName).GetStringValue()
                ZLevel = level.GetParameters().GetS(LevelElevation).GetDoubleValue()
                # print(level.GetParameters().GetS(LevelElevation).GetDoubleValue())
                # print(level.GetParameters().GetS(LevelName).GetStringValue())
                # print(objectCollection.GetById(parameterContainer.GetS(LevelId).GetIntValue()).UniqueIdS)
                # print(parameterContainer.GetS(LevelId).GetIntValue())
                # print(quantitiesContainer.GetS(RelativeObjectTopElevation).AsLength(4))
                # room.Id = objectCollection.GetById(objectId).UniqueIdS

                for j in range(Object3D.GetMesh(0).GridCount):  # У комнаты 1 меш
                    gridRoom = Object3D.GetMesh(0).GetGrid(j)  # разбиваем комнаты на грид
                    if gridRoom.GridType == 1:  # идентификатор пола, ищем пол комнаты
                        for k in range(gridRoom.VertexCount):  # Перебираем вершины
                            points.append({'x': gridRoom.GetVertex(k).X / 1000, 'y': gridRoom.GetVertex(k).Y / 1000})
                            # print(f' Комната {gridRoom.GetVertex(k)}')
                            # xPoints.append(gridRoom.GetVertex(k).X)
                            # yPoints.append(gridRoom.GetVertex(k).Y)
                        points.append(points[0])
                # triangleVertex.append(triangle)
                room['XY'] = [{'points': points}]
                # pprint(room)
                # roomsData[levelUuid] = []
                roomsData.append(room)
                # pprint(roomsData)
        return {"xPoints": xPoints,
                "yPoints": yPoints}

    def getCoordDoor():
        xPoints = []
        yPoints = []
        for i in range(Objects3DCollection.Count):
            # print(f'сколько всего обжект 3Д коллекшн{Objects3DCollection.Count}')
            # print(project.DataExporter.GetObjects3D().Get(6).ModelObjectTypeS)
            Object3D = Objects3DCollection.Get(i)
            if Object3D.ModelObjectTypeS == doorType:  # Ищем меши комнаты
                door = {}
                points = []
                objectId = Object3D.ModelObjectId
                door['Sign'] = 'Door'
                door['Output'] = []
                id_string = str(objectCollection.GetById(objectId).UniqueIdS)
                door['Id'] = id_string[1:len(id_string) - 1]
                door['@'] = id_string[1:len(id_string) - 1]
                door['Name'] = objectCollection.GetById(objectId).Name
                parameterContainer = objectCollection.GetById(objectId).GetParameters()
                LevelId = '{8cdf2e5b-03f7-4101-9b43-93b9da18f411}'.upper()
                LevelElevation = '{440a20f8-42b8-4a5f-9000-39ef58e0302b}'.upper()
                LevelName = '{1bb1addf-a3c0-4356-9525-107ea7df1513}'.upper()
                DoorWidth = '{569911cd-d708-4274-bc17-107c6a5d47a1}'.upper()
                DoorHeight = '{eae12886-6635-4292-b46e-e1a15b5df263}'.upper()
                ParentObjectName = '{26f7604a-ebaa-449c-8305-2ab01273d0eb}'.upper()
                ParentObjectUniqueId = '{0d915b9f-2c28-4c3a-9d9f-4055fb7de95a}'.upper()
                # print(objectCollection.GetById(parameterContainer.GetS(LevelId).GetIntValue()).UniqueIdS)
                level = objectCollection.GetById(parameterContainer.GetS(LevelId).GetIntValue())
                # door['roomLevelName'] = level.GetParameters().GetS(LevelName).GetStringValue()
                door['ZLevel'] = level.GetParameters().GetS(LevelElevation).GetDoubleValue()
                print(parameterContainer.GetS(LevelId).GetIntValue())
                door['Width'] = parameterContainer.GetS(DoorWidth).GetDoubleValue() / 1000
                door['SizeZ'] = parameterContainer.GetS(DoorHeight).GetDoubleValue()
                pointsZ = []
                # print(f'мешей у двери{Object3D.GetMesh(0).GetGrid(0)}')
                # for j in range(Object3D.GetMesh(0).GridCount): # У комнаты 1 меш
                for j in range(Object3D.GetMesh(0).GridCount):  # У комнаты 1 меш
                    gridRoom = Object3D.GetMesh(0).GetGrid(j)  # разбиваем комнаты на грид
                    if gridRoom.GridType == 4:  # идентификатор пола, ищем пол комнаты
                        for k in range(gridRoom.VertexCount):  # Перебираем вершины
                            points.append({'x': gridRoom.GetVertex(k).X / 1000, 'y': gridRoom.GetVertex(k).Y / 1000,
                                           'z': gridRoom.GetVertex(k).Z / 1000})
                            pointsZ.append(gridRoom.GetVertex(k).Z / 1000)
                            # print(f'Дверь {gridRoom.GetVertex(k)}')
                            # xPoints.push(gridRoom.GetVertex(k).X)
                            # yPoints.push(gridRoom.GetVertex(k).Y)
                        points.append(points[0])
                maxPointZ = max(pointsZ)
                polygonPointsStair = []
                for point in points:
                    if ((point['z'] == maxPointZ) and point not in polygonPointsStair):
                        polygonPointsStair.append(point)
                door['XY'] = [{'points': polygonPointsStair}]
                # pprint(door)
                doorsData.append(door)
        return {"xPoints": xPoints,
                "yPoints": yPoints}

    getCoordRoom()
    getCoordDoor()

    # level()
    # pprint(f'Уровни {levelData}')

    # def inEdge(x, y, xp, yp):
    #    c=False
    #    for idx in range(len(x)):
    #        for i in range(len(xp)):
    #            #if ((abs(yp[i] - y[idx]) + abs(yp[i-1] - y[idx])) == (yp[i-1] - yp[i]) and (abs(xp[i] - x[idx]) + abs(xp[i-1] - x[idx])) == (xp[i-1] - xp[i])):
    #            if ((x[idx] - xp[i])*(yp[i-1] - yp[i]) == (y[idx] - yp[i])*(xp[i-1] - xp[i])):
    #            #if (x[idx]>= xp[i] and x[idx] <=xp[i-1] and y[idx] >= yp[i] and y[idx] <= yp[i-1]):
    #
    #                c = True
    #                return c
    #                print((x[idx] - xp[i])*(yp[i-1] - yp[i]) - (y[idx] - yp[i])*(xp[i-1] - xp[i]))
    #    return c

    def inEdge(x, y, xp, yp):
        for idx in range(len(x)):
            for i in range(len(xp)):
                inEdge = (xp[i] == xp[i - 1] and xp[i] == x[idx] and min(yp[i], yp[i - 1]) <= y[idx] <= max(yp[i],
                                                                                                            yp[i - 1]))
                if not inEdge:
                    inEdge = (yp[i] == yp[i - 1] and yp[i] == y[idx] and min(xp[i], xp[i - 1]) <= x[idx] <= max(xp[i],
                                                                                                                xp[
                                                                                                                    i - 1]))
                if not inEdge:
                    inEdge = (min(yp[i], yp[i - 1]) <= y[idx] <= max(yp[i], yp[i - 1]) and min(xp[i], xp[i - 1]) <= x[
                        idx] <= max(xp[i], xp[i - 1]))
                if not inEdge:  # проверка вхождения точки в отрезок (Общее уравнение прямой)
                    a = yp[i] - yp[i - 1]
                    b = xp[i - 1] - xp[i]
                    c = xp[i - 1] * yp[i] - xp[i] * yp[i - 1]
                    inEdge = (a * x[idx] + b * y[idx] + c == 0)
                if (inEdge): return inEdge

    def inEdgeXYZ(x, y, z, xp, yp, zp, doorSizeZ):
        for idx in range(len(x)):
            for i in range(len(xp)):
                botDoor = max(zp) - doorSizeZ
                inEdge = (xp[i] == xp[i - 1] and xp[i] == x[idx] and min(yp[i], yp[i - 1]) <= y[idx] <= max(yp[i], yp[
                    i - 1]) and botDoor <= z[idx] <= max(zp))
                if not inEdge:
                    inEdge = (yp[i] == yp[i - 1] and yp[i] == y[idx] and min(xp[i], xp[i - 1]) <= x[idx] <= max(xp[i],
                                                                                                                xp[
                                                                                                                    i - 1]) and botDoor <=
                              z[idx] <= max(zp))
                if not inEdge:
                    inEdge = (min(yp[i], yp[i - 1]) <= y[idx] <= max(yp[i], yp[i - 1]) and min(xp[i], xp[i - 1]) <= x[
                        idx] <= max(xp[i], xp[i - 1]) and botDoor <= z[idx] <= max(zp))
                # if not inEdge:           проверка вхождения точки в отрезок (Общее уравнение прямой)
                #    a = yp[i] - yp[i-1]
                #    b = xp[i-1] - xp[i]
                #    c = xp[i-1]*yp[i] - xp[i]*yp[i-1]
                #    inEdge = (a*x[idx]+b*y[idx]+c == 0)
                if (inEdge): return inEdge

    def getCoord(BuildElem):
        X = []
        Y = []
        for i in range(len(BuildElem['XY'][0]['points'])):
            X.append(BuildElem['XY'][0]['points'][i]['x'])
            Y.append(BuildElem['XY'][0]['points'][i]['y'])
        return {'X': X, 'Y': Y}

    def getCoordXYZ(BuildElem):
        X = []
        Y = []
        Z = []
        for i in range(len(BuildElem['XY'][0]['points'])):
            X.append(BuildElem['XY'][0]['points'][i]['x'])
            Y.append(BuildElem['XY'][0]['points'][i]['y'])
            Z.append(BuildElem['XY'][0]['points'][i]['z'])
        return {'X': X, 'Y': Y, 'Z': Z}

    def inDoor(doorSizeZ, zStair, zDoor):
        for stair in zStair:
            for door in zDoor:
                if (door - doorSizeZ <= stair and stair <= door):
                    print(f'door - doorSizeZ {door - doorSizeZ} <= stair {stair} <= door {door}')
                    return True

    def getBuildingInfo():
        buildingInfo = project.BuildingInfo()
        buildingName = buildingInfo.Name
        buildingAddres = buildingInfo.GetAddres()
        return buildingInfo

    def bondObj():
        level = []

        for room in roomsData:
            roomPoints = getCoord(room)
            for door in doorsData:
                doorPoints = getCoord(door)
                if (room['ZLevel'] == door['ZLevel']):
                    if (inEdge(doorPoints['X'], doorPoints['Y'], roomPoints['X'], roomPoints['Y'])):
                        room['Output'].append(door['Id'])
                        door['Output'].append(room['Id'])
                if (len(door['Output']) < 2):
                    door['Sign'] = 'DoorWayOut'
                else:
                    door['Sign'] = 'DoorWayInt'

        for stair in stairsData:
            stairPoints = getCoordXYZ(stair)
            for door in doorsData:
                doorPoints = getCoordXYZ(door)
                if (inEdgeXYZ(stairPoints['X'], stairPoints['Y'], stairPoints['Z'], doorPoints['X'], doorPoints['Y'],
                              doorPoints['Z'], door['SizeZ'])):
                    stair['Output'].append(door['Id'])
                    door['Output'].append(stair['Id'])
                if (len(door['Output']) < 2):
                    door['Sign'] = 'DoorWayOut'
                else:
                    door['Sign'] = 'DoorWayInt'

        # pprint(roomsData)
        # pprint(doorsData)
        BuildElement = roomsData + doorsData + stairsData

        # pprint(f' door id  {getCoord(doorsData[0])}')
        # pprint(f' rooms id  {getCoord(roomsData[0])}')

        # pprint(BuildElement)

        for elevetion in levelData:
            tempLevel = []
            for idx in range(len(BuildElement)):
                try:
                    if BuildElement[idx]['ZLevel'] == elevetion['levelZ']:
                        BuildElement[idx].pop('ZLevel')
                        tempLevel.append(BuildElement[idx])
                except KeyError:
                    continue
            level.append(
                {'Name': elevetion['levelName'], 'SizeZ': elevetion['levelZ'] / 1000, 'BuildElement': tempLevel})
        # pprint(level)

        jsn = {
            "nameBuilding": project.BuildingInfo.Name,
            "program_name": 'Программа создания файла JSON',
            "address_building": {
                "city": project.BuildingInfo.GetAddress().Town,
                "streetAddress": '',
                "addInfo": '',
                "country": project.BuildingInfo.GetAddress().Country,
                "region": project.BuildingInfo.GetAddress().Region,
                "postcode": project.BuildingInfo.GetAddress().Postcode
            },
            "Level": level,
            "Devs": []
        }

        with open(f'../res/{file_name}.json', 'w', encoding='utf-8') as jsonf:
            jsonString = json.dumps(jsn, indent=4, ensure_ascii=False)
            jsonf.write(jsonString)

    level()
    bondObj()

    result = app.CloseProject(1)
    if result != 0:
        print("Error closing project")

    app.Quit()


if __name__ == '__main__':
    main()
