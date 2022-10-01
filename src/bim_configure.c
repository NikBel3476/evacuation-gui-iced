/* Copyright © 2022 bvchirkov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "bim_configure.h"

void                        bim_cfg_unload  (bim_cfg_scenario_t* bim_cfg_scenario)
{
    free(bim_cfg_scenario->bim_jsons);
    free(bim_cfg_scenario);
}
