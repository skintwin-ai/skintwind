using Workerd = import "/workerd/workerd.capnp";
using Skintwind = import "skintwind.capnp";

# Skintwind Configuration
# 
# Complete configuration for running the skintwind worker with
# salons, formulations, and procedures data embedded as JSON.

const skintwindService :Workerd.Config = (
  services = [ (name = "main", worker = .mainWorker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ Skintwind.extension ],
);

const mainWorker :Workerd.Worker = (
  modules = [
    (name = "worker", esModule = embed "skintwind-worker.js")
  ],
  compatibilityDate = "2025-02-01",
  bindings = [
    (
      name = "skintwind",
      wrapped = (
        moduleName = "skintwind:binding",
        innerBindings = [
          ( name = "salons", json = embed "salons.json" ),
          ( name = "formulations", json = embed "formulations.json" ),
          ( name = "procedures", json = embed "procedures.json" )
        ],
      )
    )
  ],
);
