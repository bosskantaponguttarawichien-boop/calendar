import React from 'react';

interface FlexBox {
  type: 'box';
  layout: 'vertical' | 'horizontal' | 'baseline';
  contents: any[];
  backgroundColor?: string;
  margin?: string;
  spacing?: string;
  paddingAll?: string;
}

interface FlexText {
  type: 'text';
  text: string;
  weight?: 'bold' | 'regular';
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl';
  color?: string;
  align?: 'start' | 'center' | 'end';
  margin?: string;
  flex?: number;
  wrap?: boolean;
}

interface FlexBubble {
  type: 'bubble';
  size?: 'nano' | 'micro' | 'kilo' | 'mega' | 'giga';
  header?: FlexBox;
  hero?: any;
  body?: FlexBox;
  footer?: FlexBox;
}

const sizeMap = {
  xxs: '10px', xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px', xxl: '24px', '3xl': '30px'
};

const bubbleWidth = {
  nano: '120px', micro: '160px', kilo: '260px', mega: '300px', giga: '340px'
};

const RenderContent = ({ content }: { content: any }) => {
  if (content.type === 'text') {
    const text = content as FlexText;
    return (
      <div style={{
        fontSize: sizeMap[text.size || 'md'],
        fontWeight: text.weight === 'bold' ? 'bold' : 'normal',
        color: text.color || 'inherit',
        textAlign: text.align || 'left',
        marginTop: text.margin === 'md' ? '8px' : text.margin === 'lg' ? '12px' : '0',
        flex: text.flex,
        whiteSpace: text.wrap ? 'normal' : 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {text.text}
      </div>
    );
  }

  if (content.type === 'box') {
    const box = content as FlexBox;
    return (
      <div style={{
        display: 'flex',
        flexDirection: box.layout === 'vertical' ? 'column' : 'row',
        alignItems: box.layout === 'baseline' ? 'baseline' : 'stretch',
        backgroundColor: box.backgroundColor,
        padding: box.paddingAll || '0',
        marginTop: box.margin === 'md' ? '8px' : box.margin === 'lg' ? '12px' : '0',
        gap: box.spacing === 'sm' ? '4px' : box.spacing === 'md' ? '8px' : '0'
      }}>
        {box.contents.map((c, i) => <RenderContent key={i} content={c} />)}
      </div>
    );
  }

  return null;
};

export const FlexMessageEmulator: React.FC<{ json: any }> = ({ json }) => {
  // Handle "flex" envelope
  const root = json.type === 'flex' ? json.contents : json;

  if (root.type === 'carousel') {
    return (
      <div className="flex-emulator-carousel" style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        overflowX: 'auto',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        borderRadius: '12px',
        maxWidth: '100%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {root.contents.map((bubble: any, i: number) => (
          <div key={i} style={{ flexShrink: 0 }}>
             <BubbleRenderer json={bubble} />
          </div>
        ))}
      </div>
    );
  }

  return <BubbleRenderer json={root} />;
};

const BubbleRenderer: React.FC<{ json: FlexBubble }> = ({ json }) => {
  return (
    <div className="flex-emulator-bubble" style={{
      width: bubbleWidth[json.size || 'mega'],
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      border: '1px solid #ddd'
    }}>
      {json.header && (
        <div style={{ padding: '16px', backgroundColor: json.header.backgroundColor }}>
          {json.header.contents.map((c, i) => <RenderContent key={i} content={c} />)}
        </div>
      )}
      
      {json.body && (
        <div style={{ padding: '20px' }}>
          {json.body.contents.map((c, i) => <RenderContent key={i} content={c} />)}
        </div>
      )}

      {json.footer && (
        <div style={{ padding: '12px', borderTop: '1px solid #eeeeee' }}>
          {json.footer.contents.map((c, i) => <RenderContent key={i} content={c} />)}
        </div>
      )}
    </div>
  );
};
