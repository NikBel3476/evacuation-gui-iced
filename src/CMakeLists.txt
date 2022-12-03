cmake_minimum_required(VERSION 3.24)
project(
    EvacuationC
    VERSION 0.1.0
    DESCRIPTION "Simulation of evacuation from a building"
    LANGUAGES C
)

set(CMAKE_C_STANDARD 17)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/build")

add_library(EvacuationC
    STATIC
        bim_configure.c
        bim_evac.c
        bim_graph.c
        bim_json_object.c
        bim_output.c
        bim_polygon_tools.c
        bim_tools.c
        run.c
)

target_include_directories(${PROJECT_NAME}
    PUBLIC
        "${CMAKE_CURRENT_SOURCE_DIR}../thirdparty/triangle"
        "${CMAKE_CURRENT_SOURCE_DIR}../thirdparty/arraylist"
        "${CMAKE_CURRENT_SOURCE_DIR}../thirdparty/c-logger"
)