// Copyright (c) 2024 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

import { Skintwind } from "skintwind-internal:impl";

/**
 * Binding module - creates a Skintwind instance from environment data
 */
function makeSkintwindBinding(env) {
  // Combine salons, formulations and procedures from inner bindings
  const data = {
    salons: env.salons || [],
    formulations: env.formulations || [],
    procedures: env.procedures || [],
  };
  
  return new Skintwind(data);
}

export default makeSkintwindBinding;
