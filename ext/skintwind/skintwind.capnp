using Workerd = import "/workerd/workerd.capnp";

# Skintwind Extension Definition
# 
# This defines the skintwind extension as a specific application of workerd
# to the skincare supply chain, combining generic supply chain patterns
# with skincare-specific functionality.

const extension :Workerd.Extension = (
  modules = [
    # Public module that can be imported by users
    ( name = "skintwind:skintwind", esModule = embed "skintwind.js" ),
    
    # Internal implementation - hidden from user code
    ( name = "skintwind-internal:impl", esModule = embed "skintwind-impl.js", internal = true ),
    
    # Binding module - only internal modules can be used for bindings
    ( name = "skintwind:binding", esModule = embed "skintwind-binding.js", internal = true ),
  ]
);
