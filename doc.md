#css-doc

@namespace
@keywords
@references
@var
@mixin
@element
@component
@modifier
@block
@block-element
@block-modifier

## Namespace
You can use the @namespace key to group multiple doc blocks together. If you not define the namespace is set automatically to global.

## Identifiers
Use identifiers to label the usecase of the documented block. Allowed identifiers are 
*@var for variables
*@mixin for mixins
@element for native html elements
@component for classes defining a custom component
@modifier for classes defining a modification
@block for BEM blocks
@block-element for BEM block elements
@block-modifier for BEM block modifiers 

The identifiers don't need any value, except you want reference them through the @references key. 
In that case you need to set a unique name in actual namespace and identifier.

## Keywords
Feel free to add multiple keywords you can later search on. The keywords must be space free comma seperated list.

## References
@references key give you the possibility to join other docs parts to one logical group. These can come also from other namespaces.