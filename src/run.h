//
// Created by nikit on 21.08.2022.
//

#ifndef RUN_H
#define RUN_H

#include <stdio.h>
#include <string.h>
#include "../thirdparty/c-logger/src/logger.h"
#include "../thirdparty/c-logger/src/loggerconf.h"

#include "bim_json_object.h"
#include "../src-tauri/src/bim_json_object/src/bim_json_object_rust.h"
#include "bim_tools.h"
#include "bim_graph.h"
#include "bim_evac.h"
#include "../src-tauri/src/bim_cli/src/bim_cli.h"
#include "bim_configure.h"
#include "../src-tauri/src/bim_configure/src/bim_configure_rust.h"
#include "bim_output.h"
#include "../src-tauri/src/bim_output/src/bim_output_rust.h"

void run();

#endif //RUN_H
