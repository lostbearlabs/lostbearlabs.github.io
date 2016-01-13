using System;
using System.Net;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Documents;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Shapes;
using System.Collections.Generic;

namespace Spring
{
    public class ShapeManager
    {
        Canvas TheCanvas;
        List<Shape> _shapes = new List<Shape>();
        Shape _tracked = null;
        double _offsetX = 0.0;
        double _offsetY = 0.0;

        public ShapeManager(Canvas cx)
        {
            TheCanvas = cx;
        }

        public bool IsTracked(Shape x)
        {
            return x == _tracked;
        }

        public void Add(Shape Bob)
        {
            Bob.MouseLeftButtonDown += new MouseButtonEventHandler(Bob_MouseLeftButtonDown);
            Bob.MouseLeftButtonUp += new MouseButtonEventHandler(Bob_MouseLeftButtonUp);
            Bob.MouseMove += new MouseEventHandler(Bob_MouseMove);

            _shapes.Add(Bob);
        }


        void Bob_MouseMove(object sender, MouseEventArgs e)
        {
            if (sender == _tracked)
            {
                double currentMouseX = e.GetPosition(TheCanvas).X;
                double currentMouseY = e.GetPosition(TheCanvas).Y;

                double x = currentMouseX - _offsetX;
                double y = currentMouseY - _offsetY;

                double xMin = Canvas.GetLeft(TheCanvas);
                double yMin = Canvas.GetTop(TheCanvas);
                double xMax = TheCanvas.ActualWidth - _tracked.Width;
                double yMax = TheCanvas.ActualHeight - _tracked.Height;

                x = Math.Max(x, xMin);
                x = Math.Min(x, xMax);
                y = Math.Max(y, yMin);
                y = Math.Min(y, yMax);

                Canvas.SetLeft(_tracked, x);
                Canvas.SetTop(_tracked, y);
            }
        }


        void Bob_MouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            if (sender == _tracked)
            {
                _tracked.Opacity *= 2.0;
                _tracked.ReleaseMouseCapture();
                _tracked = null;
            }
        }

        void Bob_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (_tracked == null)
            {
                _tracked = sender as Shape;

                double currentMouseX = e.GetPosition(TheCanvas).X;
                double currentMouseY = e.GetPosition(TheCanvas).Y;
                _offsetX = currentMouseX - Canvas.GetLeft(_tracked);
                _offsetY = currentMouseY - Canvas.GetTop(_tracked);

                _tracked.Opacity *= 0.50;
                _tracked.CaptureMouse();
            }
        }

    }
}
