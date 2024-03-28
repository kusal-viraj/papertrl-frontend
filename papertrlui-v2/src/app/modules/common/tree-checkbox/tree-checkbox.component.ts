import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-tree-checkbox',
  templateUrl: './tree-checkbox.component.html',
  styleUrls: ['./tree-checkbox.component.scss']
})
export class TreeCheckboxComponent implements OnInit{
  selectedNodes = [];
  @Input() nodes = [];
  @Input() detailView = false;

  ngOnInit(): void {
  }

  /**
   * Used for set the selected keys for this.selectedNodes
   * and mark '-' and 'tick' in checkboxes
   * @param selectedNodes selected key array
   * @param nodes tree nodes
   */
  selectNodes(selectedNodes: any[], nodes: any[]): void {
    this.selectedNodes = selectedNodes;
    this.preselectNodes(nodes);
    this.propagateStateUpwards(nodes);
  }


  preselectNodes(nodes: any[]): void {
    nodes.forEach(node => {
      // Preselect node if its key is in the presetKeys array
      node.selected = this.selectedNodes.includes(node.key);
      node.indeterminate = false;  // Reset indeterminate state

      // Recursively preselect child nodes
      if (node.children && node.children.length > 0) {
        this.preselectNodes(node.children);
      }
    });
  }

  propagateStateUpwards(nodes: any[]): void {
    nodes.forEach(node => {
      // If the node is preselected, update its parent nodes
      if (node.selected) {
        this.updateParentNodes(node);
      }

      // Recursively apply this to child nodes
      if (node.children && node.children.length > 0) {
        this.propagateStateUpwards(node.children);
      }
    });
  }

  onCheckboxChange(node: any, isChecked: boolean): void {
    if (this.detailView){
      return;
    }
    node.selected = !isChecked;
    node.indeterminate = false;
    // Reset indeterminate state when checkbox is clicked
    // Propagate changes to child nodes if any
    if (node.children && node.children.length > 0) {
      this.setChildrenSelectedState(node.children, !isChecked);
    }
    // Propagate changes to parent nodes
    this.updateParentNodes(node);
  }

  setChildrenSelectedState(children: any[], selected: boolean): void {
    children.forEach(child => {
      child.selected = selected;
      child.indeterminate = false;
      // Reset indeterminate state
      if (child.children && child.children.length > 0) {
        this.setChildrenSelectedState(child.children, selected);
      }
    });
  }

  updateParentNodes(childNode: any): void {
    const parentNode = this.findParentNode(this.nodes, childNode);
    if (parentNode) {
      const children = parentNode.children;
      const selectedChildren = children.filter(child => child.selected).length;
      const indeterminateChildren = children.filter(child => child.indeterminate).length;

      parentNode.selected = selectedChildren === children.length;
      parentNode.indeterminate = !parentNode.selected && (selectedChildren > 0 || indeterminateChildren > 0);

      // Recursively update the state up the tree
      this.updateParentNodes(parentNode);
    }
  }

  findParentNode(nodes: any[], childNode: any, parentNode: any = null): any {
    for (let node of nodes) {
      if (node === childNode) {
        return parentNode;
      } else if (node.children && node.children.length > 0) {
        const found = this.findParentNode(node.children, childNode, node);
        if (found) return found;
      }
    }
    return null;
  }

  toggle(node: any): void {
    node.expanded = !node.expanded;
  }

  getSelectedKeys(nodes: any[], selectedKeys: any[] = []): any[] {
    nodes.forEach(node => {
      if (node.selected) {
        selectedKeys.push(node.key); // If node is selected, add its key to the array
      }

      // Recursively check child nodes
      if (node.children && node.children.length > 0) {
        this.getSelectedKeys(node.children, selectedKeys);
      }
    });

    return selectedKeys;
  }

  protected readonly event = event;
}
